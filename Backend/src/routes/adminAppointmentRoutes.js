// src/routes/adminAppointmentRoutes.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  getAllAppointments,
  getAppointmentStats,
  cancelAppointmentByAdmin,
  assignStaff,
  updateAppointmentStatus,
} = require("../controllers/AdminAppoitmentcontroller"); // Your admin controller

// =======================
// PROTECTED ROUTES
// =======================
router.use(protect); // Only authenticated users can access

// Admin: Get all appointments
router.get("/appointments", getAllAppointments);

// Admin: Get appointment stats
router.get("/appointments/stats", getAppointmentStats);

// Admin: Cancel any appointment
router.put("/appointments/:id/cancel", cancelAppointmentByAdmin);

// Admin: Assign staff to appointment
router.put(
  "/appointments/:id/assign-staff",
  body("staffId").notEmpty().withMessage("Staff ID is required"),
  assignStaff
);

// Admin: Update appointment status
router.put(
  "/appointments/:id/status",
  body("status").notEmpty().withMessage("Status is required"),
  updateAppointmentStatus
);

module.exports = router;
