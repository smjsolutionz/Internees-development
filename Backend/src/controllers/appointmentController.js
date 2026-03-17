const Appointment = require("../models/Appointment");
const Service = require("../models/Service.model");
const Package = require("../models/Package");
const sendEmail = require("../utils/sendEmail");
const Bill = require("../models/Bill");

/* ===============================
   GET ALL SERVICES
=============================== */
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({}).sort({ category: 1, name: 1 });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET AVAILABLE SLOTS FOR MULTI-SERVICES
=============================== */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { serviceIds } = req.query;

    if (!serviceIds)
      return res.status(400).json({ success: false, message: "serviceIds required" });

    const serviceIdArray = serviceIds.split(",");
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Generate all time slots
    const allSlots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let minute of [0, 30]) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }

    let combinedSlots = new Set();

    for (let serviceId of serviceIdArray) {
      const appointments = await Appointment.find({
        services: serviceId,
        appointmentDate: selectedDate,
        status: { $nin: ["cancelled"] },
      });

      const bookedSlots = appointments.map(a => a.appointmentTime);
      allSlots.filter(slot => !bookedSlots.includes(slot)).forEach(slot => combinedSlots.add(slot));
    }

    res.json({ success: true, date, availableSlots: Array.from(combinedSlots).sort() });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   CREATE APPOINTMENT FOR MULTI-SERVICES
=============================== */
exports.createAppointment = async (req, res, next) => {
  try {
    const { serviceIds, appointmentDate, appointmentTime, customerName, customerEmail, customerPhone, notes } = req.body;
    const isAuth = req.user && req.user._id;
    const errors = {};

    if (!serviceIds || serviceIds.length === 0) errors.services = "At least one service is required";
    if (!appointmentDate) errors.appointmentDate = "Date is required";
    if (!appointmentTime) errors.appointmentTime = "Time is required";

    if (!isAuth) {
      if (!customerName?.trim()) errors.customerName = "Name required";
      if (!customerEmail?.trim()) errors.customerEmail = "Email required";
      if (!customerPhone?.trim()) errors.customerPhone = "Phone required";
    }

    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });

    const services = await Service.find({ _id: { $in: serviceIds } });
    if (services.length !== serviceIds.length)
      return res.status(400).json({ success: false, message: "Some services not found" });

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today)
      return res.status(400).json({ success: false, message: "Cannot book past date" });

    const existing = await Appointment.findOne({
      appointmentDate: selectedDate,
      appointmentTime,
      status: { $nin: ["cancelled"] },
      services: { $in: serviceIds },
    });

    if (existing)
      return res.status(400).json({ success: false, message: "One of the selected services is already booked at this time" });

    const totalDuration = services.reduce((sum, s) => sum + Number(s.duration), 0);
    const totalPrice = services.reduce((sum, s) => sum + Number(s.pricing), 0);

    const data = {
      services: serviceIds,
      appointmentDate: selectedDate,
      appointmentTime,
      duration: totalDuration,
      price: totalPrice,
      notes: notes?.trim() || "",
      status: "pending",
    };

    if (isAuth) {
      data.customer = req.user._id;
      data.customerName = req.user.name;
      data.customerEmail = req.user.email;
      data.customerPhone = req.user.phone || "";
    } else {
      data.customerName = customerName.trim();
      data.customerEmail = customerEmail.trim().toLowerCase();
      data.customerPhone = customerPhone.trim();
    }

    const appointment = await Appointment.create(data);
    await appointment.populate("services");

    try {
      const serviceNames = services.map(s => s.name).join(", ");
      const html = `<h2>Appointment Confirmation</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your appointment for <b>${serviceNames}</b> on <b>${selectedDate.toDateString()}</b> at <b>${appointmentTime}</b> is confirmed.</p>`;
      await sendEmail({ to: data.customerEmail, subject: "Appointment Confirmation", html });
    } catch (e) {
      console.error("Email failed:", e);
    }

    res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET MY APPOINTMENTS
=============================== */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { $or: [{ customer: req.user._id }, { customerEmail: req.user.email }] };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("services", "name pricing duration")
      .populate("staff", "name email phone")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const appointmentsWithBills = await Promise.all(
      appointments.map(async appt => {
        const bill = await Bill.findOne({ appointmentId: appt._id });
        return { ...appt.toObject(), bill };
      })
    );

    const count = await Appointment.countDocuments(query);

    res.json({ success: true, appointments: appointmentsWithBills, totalPages: Math.ceil(count / limit), currentPage: Number(page), total: count });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   CANCEL APPOINTMENT
=============================== */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id).populate("services");
    if (!appointment) return res.status(404).json({ success: false, message: "Not found" });
    if (appointment.status === "cancelled") return res.status(400).json({ success: false, message: "Already cancelled" });

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason || "Cancelled by customer";
    appointment.cancelledAt = Date.now();
    await appointment.save();

    try {
      const serviceNames = appointment.services.map(s => s.name).join(", ");
      const html = `<p>Your appointment for <b>${serviceNames}</b> on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime} has been cancelled.</p>`;
      await sendEmail({ to: appointment.customerEmail, subject: "Appointment Cancelled", html });
    } catch (e) {
      console.error(e);
    }

    res.json({ success: true, message: "Appointment cancelled", appointment });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   RESCHEDULE APPOINTMENT
=============================== */
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("services");
    if (!appointment) return res.status(404).json({ success: false, message: "Not found" });

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    const existing = await Appointment.findOne({
      appointmentDate: selectedDate,
      appointmentTime,
      status: { $nin: ["cancelled"] },
      services: { $in: appointment.services.map(s => s._id) },
      _id: { $ne: appointment._id },
    });

    if (existing) return res.status(400).json({ success: false, message: "One of the services is already booked at this time" });

    appointment.appointmentDate = selectedDate;
    appointment.appointmentTime = appointmentTime;
    appointment.status = "pending";
    await appointment.save();

    res.json({ success: true, message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    next(error);
  }
};