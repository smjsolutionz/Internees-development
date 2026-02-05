const Appointment = require("../models/Appointment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

/* ===============================
   ADMIN: GET ALL APPOINTMENTS
=============================== */
exports.getAllAppointments = async (req, res, next) => {
  try {
    // Ensure only admin or manager can access
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { status, date, service, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (date) query.appointmentDate = new Date(date);
    if (service) query.service = service;
    if (search) query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { customerEmail: { $regex: search, $options: "i" } },
    ];

    const appointments = await Appointment.find(query)
      .populate("service", "name description price duration")
      .populate("customer", "name email phone")
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

/* ===============================
   ADMIN: GET APPOINTMENT STATS
=============================== */
exports.getAppointmentStats = async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: await Appointment.countDocuments(),
      pending: await Appointment.countDocuments({ status: "pending" }),
      confirmed: await Appointment.countDocuments({ status: "confirmed" }),
      completed: await Appointment.countDocuments({ status: "completed" }),
      cancelled: await Appointment.countDocuments({ status: "cancelled" }),
      today: await Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      }),
    };

    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   ADMIN: CANCEL ANY APPOINTMENT
=============================== */
exports.cancelAppointmentByAdmin = async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("service");

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (appointment.status === "cancelled")
      return res.status(400).json({ success: false, message: "Appointment already cancelled" });

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason || "Cancelled by admin";
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Send email
    try {
      const html = `
        <html><body>
        <h2>Appointment Cancelled by Admin</h2>
        <p>Hi ${appointment.customerName},</p>
        <p>Your appointment for <b>${appointment.service.name}</b> on <b>${appointment.appointmentDate.toDateString()}</b> at <b>${appointment.appointmentTime}</b> has been cancelled.</p>
        <p>Reason: ${appointment.cancellationReason}</p>
        </body></html>
      `;
      await sendEmail({ to: appointment.customerEmail, subject: "Appointment Cancelled", html });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.json({ success: true, message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   ADMIN: ASSIGN STAFF
=============================== */
exports.assignStaff = async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { staffId } = req.body;
    const staff = await User.findById(staffId);

    if (!staff || !["STAFF", "MANAGER", "ADMIN"].includes(staff.role))
      return res.status(400).json({ success: false, message: "Invalid staff" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.staff = staffId;
    await appointment.save();

    res.json({ success: true, message: "Staff assigned successfully", appointment });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   ADMIN: UPDATE APPOINTMENT STATUS
=============================== */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("service");

    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.status = status;
    if (status === "confirmed") {
      appointment.confirmedBy = req.user._id;
      appointment.confirmedAt = new Date();
    }
    await appointment.save();

    // Send email notification
    try {
      const html = `<p>Your appointment status is now <b>${status.toUpperCase()}</b> for ${appointment.service.name} on ${appointment.appointmentDate.toDateString()}</p>`;
      await sendEmail({ to: appointment.customerEmail, subject: "Appointment Status Updated", html });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.json({ success: true, message: "Appointment status updated", appointment });
  } catch (error) {
    next(error);
  }
};
