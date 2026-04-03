const Bill = require("../models/Bill");

exports.getRevenueReport = async (req, res) => {
  try {
    const { filter } = req.query;

    const match = {};
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // ================= DATE FILTER =================
    switch (filter) {
      case "daily":
        match.createdAt = {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        };
        break;

      case "weekly":
        const firstDayOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        match.createdAt = { $gte: firstDayOfWeek };
        break;

      case "monthly":
        match.createdAt = {
          $gte: new Date(today.getFullYear(), today.getMonth(), 1),
          $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        };
        break;

      case "yearly":
        match.createdAt = { $gte: startOfYear };
        break;
    }

    // ================= GROUP FORMAT =================
    let groupId;

    switch (filter) {
      case "daily":
        groupId = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;

      case "weekly":
        groupId = { $toString: { $week: "$createdAt" } };
        break;

      case "monthly":
        groupId = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;

      case "yearly":
        groupId = {
          $dateToString: { format: "%Y", date: "$createdAt" },
        };
        break;

      default:
        groupId = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
    }

    // ================= REVENUE BY SERVICE =================
    const revenueByService = await Bill.aggregate([
      { $match: match },

      { $unwind: "$items" }, // 🔥 important

      {
        $group: {
          _id: {
            service: "$items.name",
            period: groupId,
          },
          revenue: { $sum: "$items.price" },
          count: { $sum: 1 },
        },
      },

      { $sort: { "_id.period": 1, "_id.service": 1 } },
    ]);

    // ================= REVENUE BY PACKAGE =================
    const revenueByPackage = await Bill.aggregate([
      {
        $match: {
          ...match,
          packageName: { $ne: null },
        },
      },

      {
        $group: {
          _id: {
            package: "$packageName",
            period: groupId,
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },

      { $sort: { "_id.period": 1, "_id.package": 1 } },
    ]);

    // ================= REVENUE CHART =================
    const revenueChart = await Bill.aggregate([
      { $match: match },

      { $unwind: "$items" },

      {
        $group: {
          _id: groupId,
          revenue: { $sum: "$items.price" },
        },
      },

      { $sort: { _id: 1 } },
    ]);

    // ================= TOTAL REVENUE =================
    const totalRevenue = await Bill.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          total: { $sum: "$items.price" },
        },
      },
    ]);

    // ================= BILLS LIST =================
    const bills = await Bill.find(match).sort({ createdAt: -1 });

    // ================= RESPONSE =================
    res.json({
      success: true,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByService,
      revenueByPackage,
      revenueChart,
      bills,
    });

  } catch (error) {
    console.error("Revenue Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue report",
    });
  }
};