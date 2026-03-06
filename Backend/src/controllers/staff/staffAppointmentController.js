const TeamMember = require("../../models/TeamMember");
const Appointment = require("../../models/Appointment");

/* ===============================
   STAFF: GET MY SHIFT / ASSIGNED APPOINTMENTS
=============================== */
exports.getMyShift = async (req, res, next) => {
  try {
    const userEmail = req.user.email;

    const staffProfile = await TeamMember.findOne({
      email: userEmail,
      role: "STAFF",
      status: "Active",
    });

    if (!staffProfile) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found or not active",
      });
    }

    const { date } = req.query;

    const query = {
      staff: staffProfile._id,
      status: { $ne: "cancelled" },
    };

    // ✅ SAME timezone logic as receptionist
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

    const appointments = await Appointment.find(query)
      .populate("service", "name duration")
      .populate("package", "name totalDuration")
      .populate("staff", "_id name role email specialty profileImage")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.status(200).json({
      success: true,
      totalAppointments: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error("getMyShift error:", error);
    next(error);
  }
};