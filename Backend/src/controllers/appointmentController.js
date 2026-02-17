const Appointment = require("../models/Appointment");
const Service = require("../models/Service.model");
const Package = require("../models/Package");
const sendEmail = require("../utils/sendEmail");

/* ===============================
   GET ALL SERVICES
=============================== */
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({})
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: services.length,
      services
    });
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
    const { serviceId, packageId } = req.query;

    if (!serviceId && !packageId) {
      return res.status(400).json({
        success: false,
        message: "serviceId or packageId is required"
      });
    }

    const service = serviceId ? await Service.findById(serviceId) : null;
    const pkg = packageId ? await Package.findById(packageId) : null;

    if (serviceId && !service)
      return res.status(404).json({ success: false, message: "Service not found" });

    if (packageId && !pkg)
      return res.status(404).json({ success: false, message: "Package not found" });

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    /* ===== SERVICE / PACKAGE SPECIFIC FILTER ===== */
    let filter = {
      appointmentDate: selectedDate,
      status: { $nin: ["cancelled"] }
    };

    if (serviceId) filter.service = serviceId;
    if (packageId) filter.package = packageId;

    const appointments = await Appointment.find(filter);

    /* ===== GENERATE SLOTS ===== */
    const workingHours = { start: 9, end: 21 };
    const allSlots = [];

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute of [0, 30]) {
        allSlots.push(
          `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`
        );
      }
    }

    const bookedSlots = appointments.map(a => a.appointmentTime);
    const availableSlots = allSlots.filter(
      slot => !bookedSlots.includes(slot)
    );

    res.json({
      success: true,
      date,
      availableSlots,
      bookedSlots
    });

  } catch (error) {
    next(error);
  }
};


/* ===============================
   CREATE APPOINTMENT
=============================== */
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      serviceId,
      packageId,
      appointmentDate,
      appointmentTime,
      customerName,
      customerEmail,
      customerPhone,
      notes
    } = req.body;

    const isAuth = req.user && req.user._id;

    /* ===== VALIDATION ===== */
    const errors = {};

    if (!serviceId && !packageId)
      errors.serviceOrPackage = "Service or Package is required";

    if (!appointmentDate)
      errors.appointmentDate = "Date is required";

    if (!appointmentTime)
      errors.appointmentTime = "Time is required";

    if (!isAuth) {
      if (!customerName?.trim())
        errors.customerName = "Name required";

      if (!customerEmail?.trim())
        errors.customerEmail = "Email required";

      if (!customerPhone?.trim())
        errors.customerPhone = "Phone required";
    }

    if (Object.keys(errors).length)
      return res.status(400).json({ success: false, errors });

    /* ===== FETCH SERVICE / PACKAGE ===== */
    const service = serviceId ? await Service.findById(serviceId) : null;
    const pkg = packageId ? await Package.findById(packageId) : null;

    if (serviceId && !service)
      return res.status(400).json({
        success: false,
        message: "Service not available"
      });

    if (packageId && !pkg)
      return res.status(400).json({
        success: false,
        message: "Package not available"
      });

    /* ===== DATE CHECK ===== */
    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today)
      return res.status(400).json({
        success: false,
        message: "Cannot book past date"
      });

    /* ===== SLOT CHECK (SERVICE SPECIFIC) ===== */
    let slotFilter = {
      appointmentDate: selectedDate,
      appointmentTime,
      status: { $nin: ["cancelled"] }
    };

    if (serviceId) slotFilter.service = serviceId;
    if (packageId) slotFilter.package = packageId;

    const existing = await Appointment.findOne(slotFilter);

    if (existing)
      return res.status(400).json({
        success: false,
        message: "Slot already booked"
      });

    /* ===== CREATE DATA ===== */
    const data = {
      service: serviceId || null,
      package: packageId || null,
      appointmentDate: selectedDate,
      appointmentTime,
      duration: service?.duration || pkg?.totalDuration || 60,
      notes: notes?.trim() || "",
      price: service?.pricing || pkg?.price || 0,
      status: "pending"
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
    await appointment.populate("service package");

    /* ===== SEND EMAIL ===== */
    try {
      const html = `
        <h2>Appointment Confirmation</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your appointment for 
        <b>${pkg ? pkg.name : service.name}</b>
        on <b>${selectedDate.toDateString()}</b> 
        at <b>${appointmentTime}</b> is confirmed.</p>
      `;

      await sendEmail({
        to: data.customerEmail,
        subject: "Appointment Confirmation",
        html
      });

    } catch (e) {
      console.error("Email failed:", e);
    }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

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

    const query = {
      $or: [
        { customer: req.user._id },
        { customerEmail: req.user.email }
      ]
    };

    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("service", "name pricing duration")
      .populate("package", "name price totalDuration")
      .populate("staff", "name email phone")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });

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

    const appointment = await Appointment.findById(req.params.id)
      .populate("service package");

    if (!appointment)
      return res.status(404).json({ success: false, message: "Not found" });

    if (appointment.status === "cancelled")
      return res.status(400).json({
        success: false,
        message: "Already cancelled"
      });

    appointment.status = "cancelled";
    appointment.cancellationReason =
      cancellationReason || "Cancelled by customer";
    appointment.cancelledAt = Date.now();

    await appointment.save();

    try {
      const html = `
        <p>Your appointment for 
        ${appointment.package
          ? appointment.package.name
          : appointment.service.name}
        on ${appointment.appointmentDate.toDateString()} 
        at ${appointment.appointmentTime}
        has been cancelled.</p>
      `;

      await sendEmail({
        to: appointment.customerEmail,
        subject: "Appointment Cancelled",
        html
      });

    } catch (e) {
      console.error(e);
    }

    res.json({
      success: true,
      message: "Appointment cancelled",
      appointment
    });

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

    const appointment = await Appointment.findById(req.params.id)
      .populate("service package");

    if (!appointment)
      return res.status(404).json({ success: false, message: "Not found" });

    const newDate = new Date(appointmentDate);
    newDate.setHours(0, 0, 0, 0);

    /* ===== SLOT CHECK SERVICE SPECIFIC ===== */
    let slotFilter = {
      appointmentDate: newDate,
      appointmentTime,
      status: { $nin: ["cancelled"] },
      _id: { $ne: appointment._id }
    };

    if (appointment.service)
      slotFilter.service = appointment.service;

    if (appointment.package)
      slotFilter.package = appointment.package;

    const existing = await Appointment.findOne(slotFilter);

    if (existing)
      return res.status(400).json({
        success: false,
        message: "Slot already booked"
      });

    appointment.appointmentDate = newDate;
    appointment.appointmentTime = appointmentTime;

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment rescheduled",
      appointment
    });

  } catch (error) {
    next(error);
  }
};
