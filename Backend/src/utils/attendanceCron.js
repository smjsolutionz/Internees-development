// Attendance cron jobs - run at 12:00 AM daily
const cron = require("node-cron");
const Attendance = require("../models/Attendence.model");
const AdminUser = require("../models/adminUser.model");

/**
 * Configurable schedule for testing.
 * - Default: "0 0 * * *" (12:00 AM daily)
 * - For quick testing (every minute): set ATTENDANCE_CRON_SCHEDULE="*\/1 * * * *"
 *   Note: we write it as "*\/1 * * * *" in comments to avoid closing this block comment.
 *
 * Also configurable which day is processed:
 * - Default: ATTENDANCE_CRON_DAY_OFFSET="1" (yesterday)
 * - For testing on today's data: set ATTENDANCE_CRON_DAY_OFFSET="0"
 */
const CRON_SCHEDULE = process.env.ATTENDANCE_CRON_SCHEDULE || "0 0 * * *";
const DAY_OFFSET = Number.isFinite(Number(process.env.ATTENDANCE_CRON_DAY_OFFSET))
  ? Number(process.env.ATTENDANCE_CRON_DAY_OFFSET)
  : 1;

cron.schedule(CRON_SCHEDULE, async () => {
  try {
    const targetDay = new Date();
    targetDay.setDate(targetDay.getDate() - DAY_OFFSET);
    targetDay.setHours(0, 0, 0, 0);

    const endOfTargetDay = new Date(targetDay);
    endOfTargetDay.setHours(23, 59, 59, 999);

    // 1. Mark Missed Checkout: employees who checked in but didn't check out
    const missedCheckout = await Attendance.updateMany(
      {
        date: { $gte: targetDay, $lte: endOfTargetDay },
        checkInTime: { $ne: null },
        checkOutTime: null,
        status: { $ne: "Leave" },
      },
      { $set: { status: "Missed Checkout" } }
    );

    // 2. Mark Absent: employees with no check-in and no leave for target day
    const staffRoles = ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
    const allStaff = await AdminUser.find({
      role: { $in: staffRoles },
      status: "ACTIVE",
    }).select("_id");

    for (const emp of allStaff) {
      const existing = await Attendance.findOne({
        employeeId: emp._id,
        date: targetDay,
      });
      if (!existing) {
        const user = await AdminUser.findById(emp._id);
        await Attendance.create({
          employeeId: emp._id,
          employeeName: user.name,
          employeeRole: user.role,
          date: targetDay,
          status: "Absent",
        });
      }
    }

    console.log(
      `Attendance cron: schedule=${CRON_SCHEDULE} dayOffset=${DAY_OFFSET} missedCheckoutUpdated=${missedCheckout.modifiedCount}`
    );
  } catch (error) {
    console.error("Attendance cron job failed:", error);
  }
});