const express = require("express");
const { appointmentLimiter } = require("../middleware/rateLimiter");
const router = express.Router();
const { body } = require("express-validator");
const {
  getAllServices,
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAppointment,
  cancelAppointment,
  rescheduleAppointment,
  // Admin functions
  getAllAppointments,
  updateAppointmentStatus,
  assignStaff,
  getAppointmentStats,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

// Validation
const createAppointmentValidation = [
  body("serviceId").notEmpty().withMessage("Service is required"),
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required"),
  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment time is required"),
];

// Public routes
router.get("/services", getAllServices);
router.get("/available-slots/:date", getAvailableSlots);

// ✅ PUBLIC booking (guest + auth)
router.post("/", createAppointmentValidation, createAppointment);

router.post(
  "/",
  appointmentLimiter,
  createAppointmentValidation,
  createAppointment,
);

// ⚠️ TESTING MODE - Auth temporarily disabled
// router.get("/admin/all", getAllAppointments);
// router.get("/admin/stats", getAppointmentStats);
// ⚠️ TESTING MODE - Auth temporarily disabled
// router.put("/admin/:id/status", updateAppointmentStatus);

// Protected routes (Customer)
router.use(protect);

router.get("/my-appointments", getMyAppointments);
router.get("/:id", getAppointment);
router.put("/:id/cancel", cancelAppointment);
router.put("/:id/reschedule", rescheduleAppointment);

//Admin routes
router.get("/admin/all", authorize("admin", "manager"), getAllAppointments);
router.get("/admin/stats", authorize("admin", "manager"), getAppointmentStats);

router.put(
  "/admin/:id/status",
  authorize("admin", "staff", "manager"),
  updateAppointmentStatus,
);
router.put(
  "/admin/:id/assign-staff",
  authorize("admin", "manager"),
  assignStaff,
);

module.exports = router;
