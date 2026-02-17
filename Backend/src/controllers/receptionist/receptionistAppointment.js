const Appointment = require("../../models/Appointment");
const sendEmail = require("../../utils/sendEmail");

/* ===============================
   RECEPTIONIST: GET ALL APPOINTMENTS
=============================== */
exports.getAllAppointmentsReceptionist = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20, search } = req.query;

    const query = {};

    // ✅ Status Filter
    if (status) {
      query.status = status;
    }

    // ✅ Date Filter (FIXED - RANGE BASED)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query.appointmentDate = {
        $gte: start,
        $lte: end,
      };
    }

    // ✅ Search Filter
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    const appointments = await Appointment.find(query)
      .populate("service", "name duration pricing")
      .populate("package", "name price totalDuration")
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

    // ✅ Direct Update (Cleaner & Reliable)
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

    /* ===== OPTIONAL EMAIL ===== */
    if (appointment.customerEmail) {
      try {
        const serviceName =
          appointment.package?.name ||
          appointment.service?.name ||
          "Service";

        const html = `
          <h2>Appointment Status Updated</h2>
          <p>Hi ${appointment.customerName},</p>
          <p>Your appointment for <b>${serviceName}</b></p>
          <p>Date: <b>${new Date(
            appointment.appointmentDate
          ).toDateString()}</b></p>
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
          appointment.package?.name ||
          appointment.service?.name ||
          "Service";

        const html = `
          <h2>Appointment Cancelled</h2>
          <p>Hi ${appointment.customerName},</p>
          <p>Your appointment for <b>${serviceName}</b></p>
          <p>Date: <b>${new Date(
            appointment.appointmentDate
          ).toDateString()}</b></p>
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
    const appointment = await Appointment.findByIdAndDelete(
      req.params.id
    );

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
