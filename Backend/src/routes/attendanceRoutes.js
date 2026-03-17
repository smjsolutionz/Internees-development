const express = require("express");
const router = express.Router();
const { adminRequireAuth } = require("../middleware/adminAuth.middleware");
const { authorize } = require("../middleware/authorize");
const {
  checkIn,
  checkOut,
  markLeave,
  getMyAttendance,
  getTodayStatus,
  getAttendanceList,
  getAttendanceOverview,
  editAttendance,
} = require("../controllers/attendanceController");

// All routes require admin auth (staff login)
router.use(adminRequireAuth);

// Employee actions - Manager, Inventory Manager, Receptionist, Staff
router.post("/check-in", authorize("MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"), checkIn);
router.post("/check-out", authorize("MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"), checkOut);
router.post("/leave", authorize("MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"), markLeave);

// My attendance (all employees)
router.get("/my", authorize("MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"), getMyAttendance);
router.get("/today", authorize("MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"), getTodayStatus);

// List & overview - Admin, Manager, Receptionist
router.get("/list", authorize("ADMIN", "MANAGER", "RECEPTIONIST"), getAttendanceList);
router.get("/overview", authorize("ADMIN", "MANAGER", "RECEPTIONIST"), getAttendanceOverview);

// Edit - Manager only
router.patch("/:id", authorize("MANAGER"), editAttendance);

module.exports = router;
