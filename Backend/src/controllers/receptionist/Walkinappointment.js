const Appointment = require("../../models/Appointment");
const Service = require("../../models/Service.model");
const Package = require("../../models/Package");

/* ===============================
   GET ALL SERVICES & PACKAGES
=============================== */
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({}).sort({ category: 1, name: 1 });
    const packages = await Package.find({}).sort({ name: 1 });

    res.json({
      success: true,
      services,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET AVAILABLE SLOTS (SERVICE/PACKAGE BASED)
=============================== */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { serviceId, packageId } = req.query;

    if (!date)
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });

    if (!serviceId && !packageId)
      return res.status(400).json({
        success: false,
        message: "Service or Package is required",
      });

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    /* 🔹 Filter by Service OR Package */
    const filter = {
      appointmentDate: { $gte: selectedDate, $lt: nextDate },
      status: { $nin: ["cancelled"] },
    };

    if (serviceId) filter.service = serviceId;
    if (packageId) filter.package = packageId;

    const appointments = await Appointment.find(filter);

    /* 🔹 Generate All Slots (09:00 - 21:00) */
    const allSlots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let min of [0, 30]) {
        allSlots.push(
          `${hour.toString().padStart(2, "0")}:${min
            .toString()
            .padStart(2, "0")}`
        );
      }
    }

    const bookedSlots = appointments.map((a) => a.appointmentTime);

    res.json({
      success: true,
      date,
      allSlots,
      bookedSlots,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   CREATE WALK-IN APPOINTMENT (SERVICE/PACKAGE BASED)
=============================== */
exports.createWalkInAppointment = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      serviceId,
      packageId,
      appointmentDate,
      appointmentTime,
      notes,
    } = req.body;

    /* ========= VALIDATION ========= */
    const errors = {};

    if (!customerName?.trim())
      errors.customerName = "Customer name required";

    if (!customerPhone?.trim())
      errors.customerPhone = "Phone number required";

    if (!appointmentDate)
      errors.appointmentDate = "Date required";

    if (!appointmentTime)
      errors.appointmentTime = "Time required";

    if (!serviceId && !packageId)
      errors.serviceOrPackage = "Service or Package is required";

    if (Object.keys(errors).length)
      return res.status(400).json({ success: false, errors });

    const service = serviceId ? await Service.findById(serviceId) : null;
    const pkg = packageId ? await Package.findById(packageId) : null;

    if (serviceId && !service)
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });

    if (packageId && !pkg)
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    /* 🔹 Prevent Past Booking */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today)
      return res.status(400).json({
        success: false,
        message: "Cannot book past date",
      });

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    /* 🔹 Service/Package Specific Slot Check */
    const filter = {
      appointmentDate: { $gte: selectedDate, $lt: nextDate },
      appointmentTime,
      status: { $nin: ["cancelled"] },
    };

    if (serviceId) filter.service = serviceId;
    if (packageId) filter.package = packageId;

    const existing = await Appointment.findOne(filter);

    if (existing)
      return res.status(400).json({
        success: false,
        message: "This slot is already booked for this service/package",
      });

    /* 🔹 Create Appointment */
    const appointment = await Appointment.create({
      service: service?._id || null,
      package: pkg?._id || null,
      appointmentDate: selectedDate,
      appointmentTime,
      duration: service?.duration || pkg?.totalDuration || 60,
      price: service?.pricing || pkg?.price || 0,
      notes: notes?.trim() || "",
      status: "confirmed",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      paymentStatus: "pending",
    });

    await appointment.populate("service package");

    res.status(201).json({
      success: true,
      message: "Walk-in appointment booked successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};