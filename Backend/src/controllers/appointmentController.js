const Appointment = require("../models/Appointment");
const Service = require("../models/Service.model");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

/* ===============================
   GET ALL SERVICES
=============================== */
exports.getAllServices = async (req, res, next) => {
  try {
    // Fetch all services without isActive
    const services = await Service.find({})
      .sort({ category: 1, name: 1 });

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET AVAILABLE SLOTS
=============================== */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { serviceId } = req.query;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const appointments = await Appointment.find({
      appointmentDate: new Date(date),
      status: { $nin: ["cancelled"] },
    });

    const workingHours = { start: 9, end: 21 };
    const allSlots = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute of [0, 30]) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      }
    }

    const bookedSlots = appointments.map(a => a.appointmentTime);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ success: true, date, availableSlots, bookedSlots });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   CREATE APPOINTMENT
=============================== */
exports.createAppointment = async (req, res, next) => {
  try {
    const { serviceId, appointmentDate, appointmentTime, customerName, customerEmail, customerPhone, notes } = req.body;
    const isAuth = req.user && req.user._id;

    // Validation
    const errors = {};
    if (!serviceId) errors.serviceId = "Service is required";
    if (!appointmentDate) errors.appointmentDate = "Date is required";
    if (!appointmentTime) errors.appointmentTime = "Time is required";

    if (!isAuth) {
      if (!customerName?.trim()) errors.customerName = "Name required";
      if (!customerEmail?.trim()) errors.customerEmail = "Email required";
      if (!customerPhone?.trim()) errors.customerPhone = "Phone required";
      if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
        errors.customerEmail = "Invalid email";
      if (customerPhone && !/^(\+92|0)?3[0-9]{9}$/.test(customerPhone.replace(/[-\s]/g, "")))
        errors.customerPhone = "Invalid phone";
    }

    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });

    // Service check
    const service = await Service.findById(serviceId);
    if (!service) return res.status(400).json({ success: false, message: "Service not available" });

    // Date in future
    const selectedDate = new Date(appointmentDate);
    if (selectedDate < new Date().setHours(0, 0, 0, 0)) 
      return res.status(400).json({ success: false, message: "Cannot book past date" });

    // Slot availability
    const existing = await Appointment.findOne({
      appointmentDate: selectedDate,
      appointmentTime,
      status: { $nin: ["cancelled"] },
    });
    if (existing) return res.status(400).json({ success: false, message: "Slot already booked" });

    // Create appointment object
    const data = {
      service: serviceId,
      appointmentDate: selectedDate,
      appointmentTime,
      duration: service.duration || 60,
      notes: notes?.trim() || "",
      price: service.pricing|| 0,
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
    await appointment.populate("service", "name description pricing duration");

    // Send email
    try {
      const html = `
        <html><body>
        <h2>Appointment Confirmation</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your appointment for <b>${service.name}</b> on <b>${selectedDate.toDateString()}</b> at <b>${appointmentTime}</b> is booked.</p>
        </body></html>`;
      await sendEmail({ to: data.customerEmail, subject: "Appointment Confirmation", html });
    } catch (e) { console.error("Email failed:", e); }

    res.status(201).json({ success: true, message: "Appointment booked", appointment });
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
      .populate("service", "name description pricing duration")
      .populate("staff", "name email phone")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);
    res.json({ success: true, appointments, totalPages: Math.ceil(count / limit), currentPage: page, total: count });
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
    const appointment = await Appointment.findById(req.params.id).populate("service");

    if (!appointment) return res.status(404).json({ success: false, message: "Not found" });
    if (new Date(appointment.appointmentDate) < new Date()) return res.status(400).json({ success: false, message: "Cannot cancel past appointments" });
    if (appointment.status === "cancelled") return res.status(400).json({ success: false, message: "Already cancelled" });

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason || "Cancelled by customer";
    appointment.cancelledAt = Date.now();
    await appointment.save();

    try {
      const html = `<p>Your appointment for ${appointment.service.name} on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime} has been cancelled.</p>`;
      await sendEmail({ to: appointment.customerEmail, subject: "Appointment Cancelled", html });
    } catch (e) { console.error(e); }

    res.json({ success: true, message: "Cancelled", appointment });
  } catch (error) { next(error); }
};

/* ===============================
   RESCHEDULE APPOINTMENT
=============================== */
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate("service").populate("CUSTOMER");

    if (!appointment) return res.status(404).json({ success: false, message: "Not found" });
    if (appointment.customer?._id.toString() !== req.user._id.toString() && !["CUSTOMER"].includes(req.user.role))
      return res.status(403).json({ success: false, message: "Not authorized" });

    const existing = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $nin: ["cancelled"] },
      _id: { $ne: appointment._id }
    });
    if (existing) return res.status(400).json({ success: false, message: "Slot already booked" });

    const oldDate = appointment.appointmentDate.toDateString();
    const oldTime = appointment.appointmentTime;

    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    await appointment.save();

    try {
      const html = `<p>Your appointment has been rescheduled from ${oldDate} at ${oldTime} to ${new Date(appointmentDate).toDateString()} at ${appointmentTime}</p>`;
      await sendEmail({ to: appointment.customerEmail, subject: "Appointment Rescheduled", html });
    } catch (e) { console.error(e); }

    res.json({ success: true, message: "Rescheduled", appointment });
  } catch (error) { next(error); }
};





