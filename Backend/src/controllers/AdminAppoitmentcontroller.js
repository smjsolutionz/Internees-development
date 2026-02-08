const Appointment = require("../models/Appointment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

/* ===============================
   ADMIN: GET ALL APPOINTMENTS
=============================== */
exports.getAllAppointments = async (req, res, next) => {
  try {
    // Ensure only admin or manager can access
    if (!["ADMIN"].includes(req.user.role)) {
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
      .populate("service", "name description pricing duration")
      .populate("CUSTOMER", "name email phone")
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
    if (!["ADMIN"].includes(req.user.role)) {
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




