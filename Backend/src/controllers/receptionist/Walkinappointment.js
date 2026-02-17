const Appointment = require("../../models/Appointment");
const Service = require("../../models/Service.model");
const Package = require("../../models/Package");
const sendEmail = require("../../utils/sendEmail");

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
      packages
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   GET ALL SLOTS (Receptionist View)
   Returns: allSlots + bookedSlots
=============================== */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.params;

    if (!date)
      return res.status(400).json({ success: false, message: "Date is required" });

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Use date range to avoid timezone issues
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Get all booked appointments for that date
    const appointments = await Appointment.find({
      appointmentDate: { $gte: selectedDate, $lt: nextDate },
      status: { $nin: ["cancelled"] }
    });

    // Generate all slots (09:00 - 21:00, 30 mins)
    const allSlots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let min of [0, 30]) {
        allSlots.push(
          `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
        );
      }
    }

    // Only starting slot is blocked
    const bookedSlots = appointments.map(a => a.appointmentTime);

    res.json({
      success: true,
      date,
      allSlots,
      bookedSlots
    });

  } catch (error) {
    next(error);
  }
};

/* ===============================
   CREATE WALK-IN APPOINTMENT
=============================== */
exports.createWalkInAppointment = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      packageId,
      appointmentDate,
      appointmentTime,
      notes
    } = req.body;

    /* ========= VALIDATION ========= */
    const errors = {};
    if (!customerName?.trim()) errors.customerName = "Customer name required";
    if (!appointmentDate) errors.appointmentDate = "Date required";
    if (!appointmentTime) errors.appointmentTime = "Time required";
    if (!serviceId && !packageId)
      errors.serviceOrPackage = "Service or Package is required";

    if (Object.keys(errors).length)
      return res.status(400).json({ success: false, errors });

    const service = serviceId ? await Service.findById(serviceId) : null;
    const pkg = packageId ? await Package.findById(packageId) : null;

    if (serviceId && !service)
      return res.status(404).json({ success: false, message: "Service not found" });

    if (packageId && !pkg)
      return res.status(404).json({ success: false, message: "Package not found" });

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Prevent past booking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today)
      return res.status(400).json({ success: false, message: "Cannot book past date" });

    /* ========= SLOT DOUBLE BOOK CHECK ========= */
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const existing = await Appointment.findOne({
      appointmentDate: { $gte: selectedDate, $lt: nextDate },
      appointmentTime,
      status: { $nin: ["cancelled"] }
    });

    if (existing)
      return res.status(400).json({
        success: false,
        message: "This slot is already booked"
      });

    /* ========= CREATE APPOINTMENT ========= */
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
      customerEmail: customerEmail?.trim()?.toLowerCase() || null,
      customerPhone: customerPhone?.trim() || null,
      paymentStatus: "pending"
    });

    await appointment.populate("service package");

    /* ========= SEND EMAIL ========= */
    if (customerEmail) {
      try {
        const names = [];
        if (service) names.push(service.name);
        if (pkg) names.push(pkg.name);

        const html = `
          <h2>Walk-in Appointment Confirmed</h2>
          <p>Hi ${customerName},</p>
          <p>Your appointment for <b>${names.join(", ")}</b> is confirmed.</p>
          <p><b>Date:</b> ${selectedDate.toDateString()}</p>
          <p><b>Time:</b> ${appointmentTime}</p>
        `;

        await sendEmail({
          to: customerEmail,
          subject: "Appointment Confirmation",
          html
        });
      } catch (err) {
        console.error("Email sending failed:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Walk-in appointment booked successfully",
      appointment
    });

  } catch (error) {
    next(error);
  }
};
