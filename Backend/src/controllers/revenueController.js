const Bill = require("../models/Bill");

exports.getRevenueReport = async (req, res) => {
  try {
    const { filter } = req.query;
    const match = {};
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Apply date filter
    switch (filter) {
      case "daily":
        match.createdAt = {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        };
        break;
      case "weekly":
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
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

    // Revenue Chart: group by time
    let groupId;
    switch (filter) {
      case "daily":
        groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "weekly":
        groupId = { $week: "$createdAt" };
        break;
      case "monthly":
        groupId = { $month: "$createdAt" };
        break;
      case "yearly":
        groupId = { $year: "$createdAt" };
        break;
    }

    // Revenue by Service **per filter**
    const revenueByService = await Bill.aggregate([
      { $match: match },
      {
        $group: {
          _id: { service: "$serviceName", period: groupId }, // group by service + time
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.period": 1, "_id.service": 1 } },
    ]);

    // Revenue by Package **per filter**
    const revenueByPackage = await Bill.aggregate([
      { $match: { ...match, packageName: { $ne: null } } },
      {
        $group: {
          _id: { package: "$packageName", period: groupId },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.period": 1, "_id.package": 1 } },
    ]);

    // Revenue Chart
const revenueChart = await Bill.aggregate([
  {
    $group: {
      _id: (() => {
        switch (filter) {
          case "daily":
            return { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
          case "weekly":
            return { $toString: { $week: "$createdAt" } };
          case "monthly":
            return { $dateToString: { format: "%Y-%m", date: "$createdAt" } }; // ALL months
          case "yearly":
            return { $dateToString: { format: "%Y", date: "$createdAt" } }; // ALL years
        }
      })(),
      revenue: { $sum: "$totalAmount" },
    },
  },
  { $sort: { "_id": 1 } },
]);

    const bills = await Bill.find(match).sort({ createdAt: -1 });

    res.json({
      success: true,
      totalRevenue: revenueChart.reduce((a, b) => a + b.revenue, 0),
      revenueByService,
      revenueByPackage,
      revenueChart,
      bills,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue report" });
  }
};