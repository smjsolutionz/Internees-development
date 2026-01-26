const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

/* =========================================
   GET ALL SERVICES
========================================= */
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({
      isActive: true,
      availableForBooking: true,
    }).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   GET AVAILABLE SLOTS
========================================= */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { serviceId } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const appointments = await Appointment.find({
      appointmentDate: new Date(date),
      status: { $nin: ["cancelled"] },
    });

    const workingHours = { start: 9, end: 21 };
    const allSlots = [];

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute of [0, 30]) {
        allSlots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
        );
      }
    }

    const bookedSlots = appointments.map((apt) => apt.appointmentTime);
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot),
    );

    res.json({
      success: true,
      date,
      availableSlots,
      bookedSlots,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   CREATE APPOINTMENT (GUEST BOOKING)
========================================= */
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      serviceId,
      appointmentDate,
      appointmentTime,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = req.body;

    // 🔴 REQUIRED FIELD VALIDATION (FIXES 400)
    if (
      !serviceId ||
      !appointmentDate ||
      !appointmentTime ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.availableForBooking) {
      return res
        .status(400)
        .json({ message: "Service is not available for booking" });
    }

    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res
        .status(400)
        .json({ message: "Cannot book appointments in the past" });
    }

    const existingAppointment = await Appointment.findOne({
      appointmentDate: selectedDate,
      appointmentTime,
      status: { $nin: ["cancelled"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message:
          "This time slot is already booked. Please choose another time.",
      });
    }

    const appointment = await Appointment.create({
      service: serviceId,
      appointmentDate: selectedDate,
      appointmentTime,
      duration: service.duration,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      price: service.price,
      status: "pending",
    });

    await appointment.populate("service", "name description price duration");

    try {
      await sendEmail({
        to: customerEmail,
        subject: "Appointment Confirmation - Diamond Trim Beauty Studio",
        html: `<p>Hi ${customerName},<br>Your appointment is pending confirmation.</p>`,
      });
    } catch (err) {
      console.error("Email failed:", err);
    }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   GET MY APPOINTMENTS (AUTH USERS)
========================================= */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customer: req.user._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("service", "name description price duration category")
      .populate("staff", "name email phone")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   GET SINGLE APPOINTMENT
========================================= */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("service", "name description price duration category")
      .populate("customer", "name email phone")
      .populate("staff", "name email phone");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   CANCEL APPOINTMENT
========================================= */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledAt = Date.now();
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/appointments/admin/all
// @access  Private (Admin, Manager)
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status, date, service, page = 1, limit = 20, search } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date
    if (date) {
      query.appointmentDate = new Date(date);
    }

    // Filter by service
    if (service) {
      query.service = service;
    }

    // Search by customer name or email
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    const appointments = await Appointment.find(query)
      .populate("service", "name description price duration category")
      .populate("customer", "name email phone")
      .populate("staff", "name email phone")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    // Get statistics
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      appointments,
      stats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Admin)
// @route   PUT /api/appointments/admin/:id/status
// @access  Private (Admin, Staff)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("service")
      .populate("customer");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const oldStatus = appointment.status;
    appointment.status = status;

    if (status === "confirmed") {
      appointment.confirmedBy = req.user._id;
      appointment.confirmedAt = Date.now();
    }

    await appointment.save();

    // Send email notification
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%); padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #222227; margin: 0;">💎 Diamond Trim</h1>
          </div>
          <div class="content">
            <h2>Appointment Status Updated</h2>
            <p>Hi ${appointment.customerName},</p>
            <p>Your appointment status has been updated:</p>
            <p><strong>Previous Status:</strong> <span class="status-badge" style="background-color: #f0f0f0;">${oldStatus}</span></p>
            <p><strong>New Status:</strong> <span class="status-badge" style="background-color: #22c55e; color: white;">${status}</span></p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p><strong>Service:</strong> ${appointment.service.name}</p>
            <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        to: appointment.customerEmail,
        subject: `Appointment ${status.toUpperCase()} - Diamond Trim`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    res.json({
      success: true,
      message: "Appointment status updated",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign staff to appointment (Admin)
// @route   PUT /api/appointments/admin/:id/assign-staff
// @access  Private (Admin, Manager)
exports.assignStaff = async (req, res, next) => {
  try {
    const { staffId } = req.body;

    // Verify staff exists and has correct role
    const staff = await User.findById(staffId);
    if (!staff || !["staff", "manager", "admin"].includes(staff.role)) {
      return res.status(400).json({ message: "Invalid staff member" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.staff = staffId;
    await appointment.save();

    res.json({
      success: true,
      message: "Staff assigned successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate("service")
      .populate("customer");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check authorization
    if (
      appointment.customer._id.toString() !== req.user._id.toString() &&
      !["admin", "staff", "manager"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if new slot is available
    const existingAppointment = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $nin: ["cancelled"] },
      _id: { $ne: appointment._id },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    const oldDate = new Date(appointment.appointmentDate).toLocaleDateString();
    const oldTime = appointment.appointmentTime;

    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    await appointment.save();

    // Send email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial;">
          <div style="background: linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%); padding: 30px; text-align: center;">
            <h1 style="color: #222227; margin: 0;">💎 Diamond Trim</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Appointment Rescheduled</h2>
            <p>Hi ${appointment.customerName},</p>
            <p>Your appointment has been rescheduled:</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <strong>Previous:</strong><br>
              ${oldDate} at ${oldTime}
            </div>
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <strong>New:</strong><br>
              ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}
            </div>
            <p><strong>Service:</strong> ${appointment.service.name}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        to: appointment.customerEmail,
        subject: "Appointment Rescheduled - Diamond Trim",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment statistics (Admin)
// @route   GET /api/appointments/admin/stats
// @access  Private (Admin)
exports.getAppointmentStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: await Appointment.countDocuments(),
      pending: await Appointment.countDocuments({ status: "pending" }),
      confirmed: await Appointment.countDocuments({ status: "confirmed" }),
      completed: await Appointment.countDocuments({ status: "completed" }),
      cancelled: await Appointment.countDocuments({ status: "cancelled" }),
      today: await Appointment.countDocuments({
        appointmentDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
