const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { appointmentLimiter } = require("../middleware/rateLimiter");


const {
  getAllServices,
  getAvailableSlots,
  createAppointment,
  getMyAppointments,

  cancelAppointment,
  rescheduleAppointment, // optional, if you use it
} = require("../controllers/appointmentController");

// =======================
// Validation for creating appointments
// =======================
const createValidation = [
  body("serviceId").notEmpty().withMessage("Service required"),
  body("appointmentDate").notEmpty().withMessage("Date required"),
  body("appointmentTime").notEmpty().withMessage("Time required"),
];

// =======================
// PUBLIC ROUTES
// =======================
router.get("/services", getAllServices);
router.get("/available-slots/:date", getAvailableSlots);
router.post("/", appointmentLimiter, createValidation, createAppointment);

// =======================
// PROTECTED ROUTES
// =======================
router.use(protect); // all routes below require authentication

// Get appointments for the logged-in user
router.get("/my-appointments", getMyAppointments);



// Cancel an appointment
router.put("/:id/cancel", cancelAppointment);

// Optional: Reschedule an appointment
router.put("/:id/reschedule", rescheduleAppointment);

module.exports = router;
