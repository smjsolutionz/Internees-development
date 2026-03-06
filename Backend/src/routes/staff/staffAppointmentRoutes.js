const express = require("express");
const router = express.Router();

const {
  getMyShift
} = require("../../controllers/staff/staffAppointmentController");

const { protect, authorize } = require("../../middleware/adminCreatedUserProtection.js");

// Only STAFF role can access
router.get(
  "/my-shift",
  protect,
  authorize("STAFF"),
  getMyShift
);

module.exports = router;