// Attendance cron jobs - run at 12:00 AM daily
const cron = require("node-cron");
const Attendance = require("../models/Attendance.model");
const AdminUser = require("../models/adminUser.model");

// Run at 12:00 AM every day
cron.schedule("0 0 * * *", async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // 1. Mark Missed Checkout: employees who checked in but didn't check out
    const missedCheckout = await Attendance.updateMany(
      {
        date: { $gte: yesterday, $lte: endOfYesterday },
        checkInTime: { $ne: null },
        checkOutTime: null,
        status: "Present",
      },
      { $set: { status: "Missed Checkout" } }
    );

    // 2. Mark Absent: employees with no check-in and no leave for yesterday
    const staffRoles = ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
    const allStaff = await AdminUser.find({
      role: { $in: staffRoles },
      status: "ACTIVE",
    }).select("_id");

    for (const emp of allStaff) {
      const existing = await Attendance.findOne({
        employeeId: emp._id,
        date: yesterday,
      });
      if (!existing) {
        const user = await AdminUser.findById(emp._id);
        await Attendance.create({
          employeeId: emp._id,
          employeeName: user.name,
          employeeRole: user.role,
          date: yesterday,
          status: "Absent",
        });
      }
    }

    console.log(`Attendance cron: Missed checkout updated for ${missedCheckout.modifiedCount} records`);
  } catch (error) {
    console.error("Attendance cron job failed:", error);
  }
});
