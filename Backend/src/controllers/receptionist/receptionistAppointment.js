const Appointment = require("../../models/Appointment");
const sendEmail = require("../../utils/sendEmail");
const TeamMember = require("../../models/TeamMember");

/* ===============================
   RECEPTIONIST: GET ALL APPOINTMENTS
=============================== */
exports.getAllAppointmentsReceptionist = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20, search } = req.query;

    const query = {};

    // Status Filter
    if (status) query.status = status;

    // Date Filter (Range Based)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.appointmentDate = { $gte: start, $lte: end };
    }

    // Search Filter
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    const appointments = await Appointment.find(query)
      .populate("service", "name duration pricing")
      .populate("package", "name price totalDuration")
      .populate("staff", "_id name role email specialty profileImage") // populated from TeamMember
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const count = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   RECEPTIONIST: UPDATE STATUS
=============================== */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("service", "name")
      .populate("package", "name");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Optional email
    if (appointment.customerEmail) {
      try {
        const serviceName =
          appointment.package?.name || appointment.service?.name || "Service";

        const html = `
          <h2>Appointment Status Updated</h2>
          <p>Hi ${appointment.customerName},</p>
          <p>Your appointment for <b>${serviceName}</b></p>
          <p>Date: <b>${new Date(appointment.appointmentDate).toDateString()}</b></p>
          <p>Time: <b>${appointment.appointmentTime}</b></p>
          <p>New Status: <b>${status.toUpperCase()}</b></p>
          <br/>
          <p>Thank you,<br/>Salon Team</p>
        `;

        await sendEmail({
          to: appointment.customerEmail,
          subject: `Appointment ${status}`,
          html,
        });

        console.log("✅ Status update email sent");
      } catch (emailError) {
        console.error("❌ Email failed:", emailError.message);
      }
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   RECEPTIONIST: CANCEL APPOINTMENT
=============================== */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    )
      .populate("service", "name")
      .populate("package", "name");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.customerEmail) {
      try {
        const serviceName =
          appointment.package?.name || appointment.service?.name || "Service";

        const html = `
          <h2>Appointment Cancelled</h2>
          <p>Hi ${appointment.customerName},</p>
          <p>Your appointment for <b>${serviceName}</b></p>
          <p>Date: <b>${new Date(appointment.appointmentDate).toDateString()}</b></p>
          <p>Time: <b>${appointment.appointmentTime}</b></p>
          <p>Status: <b>CANCELLED</b></p>
          <br/>
          <p>Please contact us if needed.</p>
          <p>Salon Team</p>
        `;

        await sendEmail({
          to: appointment.customerEmail,
          subject: "Appointment Cancelled",
          html,
        });

        console.log("✅ Cancellation email sent");
      } catch (emailError) {
        console.error("❌ Email failed:", emailError.message);
      }
    }

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   RECEPTIONIST: DELETE APPOINTMENT
=============================== */
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   RECEPTIONIST: GET ALL STAFF (TEAMMEMBER)
=============================== */
exports.getAllStaffForReceptionist = async (req, res, next) => {
  try {
    // Only active STAFF role
    const staff = await TeamMember.find({ role: "STAFF", status: "Active" })
      .select("_id name email role specialty profileImage");

    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   RECEPTIONIST: ASSIGN STAFF TO APPOINTMENT
=============================== */
exports.assignStaffToAppointment = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    const appointmentId = req.params.id;

    if (!staffId)
      return res.status(400).json({ success: false, message: "Staff ID is required" });

    const staff = await TeamMember.findById(staffId);
    if (!staff || staff.role !== "STAFF")
      return res.status(404).json({ success: false, message: "Staff not found" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    // ✅ Staff availability check
    const conflict = await Appointment.findOne({
      staff: staffId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: { $nin: ["cancelled"] },
      _id: { $ne: appointmentId }, // ignore current appointment
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `${staff.name} is already assigned at this time and date`,
      });
    }

    // Assign staff
    appointment.staff = staffId;
    await appointment.save();
    await appointment.populate("service package staff");

    // Optional email
    if (staff.email) {
      const html = `
        <h2>New Appointment Assigned</h2>
        <p>Hi ${staff.name},</p>
        <p>You have been assigned to <b>${appointment.package?.name || appointment.service?.name || "Service"}</b></p>
        <p>Date: <b>${appointment.appointmentDate.toDateString()}</b></p>
        <p>Time: <b>${appointment.appointmentTime}</b></p>
        <p>Specialty: <b>${staff.specialty || "N/A"}</b></p>
        <br/><p>Thanks,<br/>Salon Team</p>
      `;
      await sendEmail({ to: staff.email, subject: "New Appointment Assigned", html });
    }

    res.json({
      success: true,
      message: "Staff assigned successfully",
      appointment,
    });
  } catch (error) {
    console.error("Assign staff error:", error);
    next(error);
  }
};
/* ===============================
   RECEPTIONIST: RESCHEDULE APPOINTMENT
=============================== */
/* ===============================
   RECEPTIONIST: RESCHEDULE APPOINTMENT WITH SLOTS CHECK
=============================== */
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const appointmentId = req.params.id;

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: "New date and time required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // 🔹 Generate all possible slots (09:00 - 21:00 every 30min)
    const allSlots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let min of [0, 30]) {
        allSlots.push(
          `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
        );
      }
    }

    // 🔹 Find booked slots for the service/package on that date
    const filterForSlots = {
      appointmentDate: { $gte: selectedDate, $lt: nextDate },
      status: { $nin: ["cancelled"] },
      _id: { $ne: appointmentId }, // exclude current appointment
    };
    if (appointment.service) filterForSlots.service = appointment.service;
    if (appointment.package) filterForSlots.package = appointment.package;

    const bookedAppointments = await Appointment.find(filterForSlots);
    const bookedSlots = bookedAppointments.map(a => a.appointmentTime);

    // 🔹 Check if selected time is available
    if (bookedSlots.includes(appointmentTime)) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked for this service/package",
        allSlots,
        bookedSlots,
      });
    }

    // 🔹 STAFF CONFLICT CHECK (if assigned)
    if (appointment.staff) {
      const staffConflict = await Appointment.findOne({
        _id: { $ne: appointmentId },
        staff: appointment.staff,
        appointmentDate: { $gte: selectedDate, $lt: nextDate },
        appointmentTime,
        status: { $nin: ["cancelled"] },
      });

      if (staffConflict) {
        return res.status(400).json({
          success: false,
          message: "Assigned staff is not available at this time",
          allSlots,
          bookedSlots,
        });
      }
    }

    // 🔹 UPDATE APPOINTMENT
    appointment.appointmentDate = selectedDate;
    appointment.appointmentTime = appointmentTime;

    await appointment.save();
    await appointment.populate("service package staff");

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
      allSlots,
      bookedSlots,
    });
  } catch (error) {
    next(error);
  }
};
/* ===============================
   RECEPTIONIST: GET AVAILABLE SLOTS FOR APPOINTMENT
=============================== */
exports.getAvailableSlotsForAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // 🔹 Generate all possible slots (09:00 - 21:00 every 30min)
    const allSlots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let min of [0, 30]) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      }
    }

    // 🔹 Find booked slots for the service/package on that date
    const filterForSlots = {
      appointmentDate: { $gte: selectedDate, $lt: nextDate },
      status: { $nin: ["cancelled"] },
      _id: { $ne: appointmentId }, // exclude current appointment
    };
    if (appointment.service) filterForSlots.service = appointment.service;
    if (appointment.package) filterForSlots.package = appointment.package;

    const bookedAppointments = await Appointment.find(filterForSlots);
    const bookedSlots = bookedAppointments.map(a => a.appointmentTime);

    // 🔹 Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      allSlots,
      bookedSlots,
      availableSlots,
    });
  } catch (error) {
    next(error);
  }
};