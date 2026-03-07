const Attendance = require("../models/Attendance.model");
const AdminUser = require("../models/adminUser.model");

// Shift end time for Late Checkout (5:00 PM)
const SHIFT_END_HOUR = 17;
const SHIFT_END_MINUTE = 0;

/* =========================
   CHECK IN
========================= */
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await AdminUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only staff roles can check in
    const allowedRoles = ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "You are not allowed to check in" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employeeId: userId,
      date: today,
    });

    if (attendance) {
      if (attendance.checkInTime) {
        return res.status(400).json({ message: "Already checked in today" });
      }
      if (attendance.status === "Leave") {
        return res.status(400).json({ message: "Leave already marked for today" });
      }
    }

    const now = new Date();
    if (!attendance) {
      attendance = await Attendance.create({
        employeeId: userId,
        employeeName: user.name,
        employeeRole: user.role,
        date: today,
        checkInTime: now,
        status: "Present",
      });
    } else {
      attendance.checkInTime = now;
      attendance.status = "Present";
      await attendance.save();
    }

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      attendance: {
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("checkIn error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CHECK OUT
========================= */
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await AdminUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: userId,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({ message: "No check-in found for today" });
    }
    if (attendance.status === "Leave") {
      return res.status(400).json({ message: "Leave marked for today, cannot check out" });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    attendance.checkOutTime = now;

    // Late Checkout: after 5:00 PM
    const shiftEnd = new Date(attendance.date);
    shiftEnd.setHours(SHIFT_END_HOUR, SHIFT_END_MINUTE, 0, 0);
    if (now > shiftEnd) {
      attendance.status = "Late Checkout";
    } else {
      attendance.status = "Present";
    }
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      attendance: {
        date: attendance.date,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("checkOut error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   MARK LEAVE
========================= */
exports.markLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, date } = req.body;

    if (!leaveType || !["Sick Leave", "Casual Leave"].includes(leaveType)) {
      return res.status(400).json({ message: "Valid leave type required (Sick Leave or Casual Leave)" });
    }

    const user = await AdminUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedRoles = ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "You are not allowed to mark leave" });
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employeeId: userId,
      date: targetDate,
    });

    if (attendance) {
      if (attendance.checkInTime) {
        return res.status(400).json({ message: "Already checked in for this day, cannot mark leave" });
      }
      attendance.status = "Leave";
      attendance.leaveType = leaveType;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employeeId: userId,
        employeeName: user.name,
        employeeRole: user.role,
        date: targetDate,
        status: "Leave",
        leaveType,
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave marked successfully",
      attendance: {
        date: attendance.date,
        leaveType: attendance.leaveType,
        status: attendance.status,
      },
    });
  } catch (err) {
    console.error("markLeave error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET MY ATTENDANCE (own history)
========================= */
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let filter = { employeeId: userId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, attendance });
  } catch (err) {
    console.error("getMyAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET TODAY'S STATUS (for dashboard buttons)
========================= */
exports.getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: userId,
      date: today,
    });

    if (!attendance) {
      return res.status(200).json({
        success: true,
        status: null,
        canCheckIn: true,
        canCheckOut: false,
        canMarkLeave: true,
      });
    }

    const canCheckIn = !attendance.checkInTime && attendance.status !== "Leave";
    const canCheckOut = !!attendance.checkInTime && !attendance.checkOutTime && attendance.status !== "Leave";
    const canMarkLeave = !attendance.checkInTime && attendance.status !== "Leave";

    res.status(200).json({
      success: true,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      leaveType: attendance.leaveType,
      canCheckIn,
      canCheckOut,
      canMarkLeave,
    });
  } catch (err) {
    console.error("getTodayStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ATTENDANCE LIST (Admin/Manager/Receptionist - filtered by role)
========================= */
exports.getAttendanceList = async (req, res) => {
  try {
    const { role, search, startDate, endDate, status } = req.query;
    const userRole = req.user.role;

    // Role-based visibility
    let allowedRoles = [];
    if (userRole === "ADMIN") {
      allowedRoles = ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
    } else if (userRole === "MANAGER") {
      allowedRoles = ["INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
    } else if (userRole === "RECEPTIONIST") {
      allowedRoles = ["STAFF"];
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    let filter = { employeeRole: { $in: allowedRoles } };

    if (role && role !== "ALL") {
      filter.employeeRole = role;
    }

    if (search) {
      filter.employeeName = { $regex: search, $options: "i" };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    if (status && status !== "ALL") {
      filter.status = status;
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1, employeeName: 1 })
      .limit(500)
      .populate("employeeId", "name email role")
      .lean();

    res.status(200).json({ success: true, attendance });
  } catch (err) {
    console.error("getAttendanceList error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ATTENDANCE OVERVIEW (for dashboards)
========================= */
exports.getAttendanceOverview = async (req, res) => {
  try {
    const userRole = req.user.role;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let roleFilter = {};
    if (userRole === "ADMIN") {
      roleFilter = { employeeRole: { $in: ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"] } };
    } else if (userRole === "MANAGER") {
      roleFilter = { employeeRole: { $in: ["INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"] } };
    } else if (userRole === "RECEPTIONIST") {
      roleFilter = { employeeRole: "STAFF" };
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const todayFilter = { ...roleFilter, date: today };

    const [present, leave, absent, missedCheckout, lateCheckout] = await Promise.all([
      Attendance.countDocuments({ ...todayFilter, status: "Present" }),
      Attendance.countDocuments({ ...todayFilter, status: "Leave" }),
      Attendance.countDocuments({ ...todayFilter, status: "Absent" }),
      Attendance.countDocuments({ ...todayFilter, status: "Missed Checkout" }),
      Attendance.countDocuments({ ...todayFilter, status: "Late Checkout" }),
    ]);

    // Total employees in scope (for absent we need: no record or status Absent)
    const rolesToCount = roleFilter.employeeRole?.$in || [roleFilter.employeeRole];
    const employeesInScope = await AdminUser.countDocuments({
      role: { $in: rolesToCount },
      status: "ACTIVE",
    });

    const totalWithRecord = present + leave + missedCheckout + lateCheckout;
    const absentCount = Math.max(absent, employeesInScope - totalWithRecord);

    res.status(200).json({
      success: true,
      overview: {
        present,
        absent: absentCount,
        leave,
        missedCheckout,
      },
    });
  } catch (err) {
    console.error("getAttendanceOverview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   EDIT ATTENDANCE (Manager only)
========================= */
exports.editAttendance = async (req, res) => {
  try {
    if (req.user.role !== "MANAGER") {
      return res.status(403).json({ message: "Only managers can edit attendance" });
    }

    const { id } = req.params;
    const { checkInTime, checkOutTime, status } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: "Attendance record not found" });

    // Manager can only edit: Receptionist, Staff, Inventory Manager
    const editableRoles = ["RECEPTIONIST", "STAFF", "INVENTORY_MANAGER"];
    if (!editableRoles.includes(attendance.employeeRole)) {
      return res.status(403).json({ message: "Cannot edit this attendance record" });
    }

    if (checkInTime !== undefined) attendance.checkInTime = checkInTime ? new Date(checkInTime) : null;
    if (checkOutTime !== undefined) attendance.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;
    if (status !== undefined) attendance.status = status;
    attendance.editedBy = req.user.id;
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (err) {
    console.error("editAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
