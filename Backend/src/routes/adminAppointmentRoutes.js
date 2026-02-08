const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const  protect  = require("../middleware/adminProtect");

const {
  getAllAppointments,
  getAppointmentStats,
 
} = require("../controllers/AdminAppoitmentcontroller"); // Your admin controller

// =======================
// PROTECTED ROUTES
// =======================
router.use(protect); // Only authenticated users can access

// Admin: Get all appointments
router.get("/appointments", getAllAppointments);

// Admin: Get appointment stats
router.get("/appointments/stats", getAppointmentStats);



module.exports = router;