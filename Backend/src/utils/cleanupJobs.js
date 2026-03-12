// utils/cleanupJobs.js
const cron = require("node-cron");
const User = require("../models/User");

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate },
    });

    console.log(`Cleanup: Deleted ${result.deletedCount} unverified users`);
  } catch (error) {
    console.error("Cleanup job failed:", error);
  }
});
