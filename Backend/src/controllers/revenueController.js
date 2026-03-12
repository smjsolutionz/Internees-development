const Bill = require("../models/Bill");

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;

    const match = {};
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // TOTAL REVENUE
    const totalRevenueAgg = await Bill.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // REVENUE BY SERVICE
   const revenueByService = await Bill.aggregate([
  {
    $match: {
      ...match,
      packageName: null
    }
  },
  {
    $group: {
      _id: "$serviceName",
      revenue: { $sum: "$totalAmount" },
      count: { $sum: 1 }
    }
  }
]);

    // REVENUE BY PACKAGE
  const revenueByPackage = await Bill.aggregate([
  {
    $match: {
      ...match,
      packageName: { $exists: true, $ne: null }
    }
  },

  {
    $lookup: {
      from: "packages",
      localField: "packageName",
      foreignField: "_id",
      as: "package"
    }
  },

  {
    $unwind: "$package"
  },

  {
    $group: {
      _id: "$package.name",
      revenue: { $sum: "$totalAmount" },
      count: { $sum: 1 }
    }
  },

  {
    $sort: { revenue: -1 }
  }
]);

    // FUNCTION TO GENERATE AGGREGATE BASED ON FILTER
    const getRevenueAggregation = async (filterType) => {
      let groupId;

      switch (filterType) {
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
        default:
          groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      }

      const revenue = await Bill.aggregate([
        { $match: match },
        {
          $group: {
            _id: groupId,
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return revenue;
    };

    const revenueChart = await getRevenueAggregation(filter);

    const bills = await Bill.find(match).sort({ createdAt: -1 });

    res.json({
      success: true,
      totalRevenue,
      revenueByService,
      revenueByPackage,  // <-- new field
      bills,
      revenueChart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue report",
    });
  }
};