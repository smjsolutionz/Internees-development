const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getAvailableSlots,
  createWalkInAppointment
} = require("../../controllers/receptionist/Walkinappointment");
const { protect, authorize } = require("../../middleware/adminCreatedUserProtection.js");

/* ===============================
   WALK-IN APPOINTMENTS ROUTES
=============================== */

// 1️⃣ GET all services
router.get("/services", getAllServices);

// 2️⃣ GET available slots for a service or package on a given date
router.get("/slots/:date", getAvailableSlots);

// 3️⃣ CREATE a new walk-in appointment

router.post("/appointments",
  
  
   createWalkInAppointment);

module.exports = router;
