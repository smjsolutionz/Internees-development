const express = require("express");
const router = express.Router();
const receptionistController = require("../../controllers/receptionist/receptionistAppointment");
const { protect, authorize } = require("../../middleware/adminCreatedUserProtection.js");

router.get(
  "/",
  protect,
  authorize("RECEPTIONIST"),
  receptionistController.getAllAppointmentsReceptionist
);

router.patch(
  "/:id/status",
  protect,
  authorize("RECEPTIONIST"),
  receptionistController.updateAppointmentStatus
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("RECEPTIONIST"),
  receptionistController.cancelAppointment
);

router.delete(
  "/:id",
  protect,
  authorize("RECEPTIONIST"),
  receptionistController.deleteAppointment
);
router.patch(
  "/:id/assign-staff",
  protect,
  authorize("RECEPTIONIST"),
  receptionistController.assignStaffToAppointment
);
router.get(
  "/staff",
  receptionistController.getAllStaffForReceptionist
);
module.exports = router;