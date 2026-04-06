const Bill = require("../../models/Bill");
const Appointment = require("../../models/Appointment");
const Service = require("../../models/Service.model"); // ✅ added
const generateBillNumber = require("../../utils/generateBillNumber");

// ================= GENERATE BILL =================
exports.generateBill = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("service")
      .populate("package");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const item = appointment.package || appointment.service;

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "No service/package found",
      });
    }

    // ✅ FIX: handle string pricing safely
    const rawPrice = item.price ?? item.pricing ?? 0;

    const price = Number(
      String(rawPrice).replace(/[^0-9.]/g, "")
    ) || 0;

    // ❗ Delete unpaid existing bill
    const existingBill = await Bill.findOne({ appointmentId });

    if (existingBill) {
      if (existingBill.paidAmount > 0) {
        return res.status(400).json({
          success: false,
          message: "Bill already paid",
        });
      }
      await existingBill.deleteOne();
    }

    const bill = await Bill.create({
      billNumber: generateBillNumber(),
      appointmentId,
      customerName: appointment.customerName,

      items: [
        {
          name: item.name || "Service",
          price,
        },
      ],

      totalAmount: price,
    });

    res.status(201).json({
      success: true,
      message: "Bill generated",
      bill,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= ADD SERVICE (UPDATED) =================
exports.addServiceToBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { serviceId, name, price } = req.body;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    let finalName = name;
    let finalPrice = Number(price) || 0;

    // ✅ If service selected from dropdown
    if (serviceId) {
      const service = await Service.findById(serviceId);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      finalName = service.name;

      // ✅ Convert "Rs 2000" → 2000
      finalPrice = Number(
        String(service.pricing).replace(/[^0-9.]/g, "")
      ) || 0;
    }

    // ❗ Validation
    if (!finalName || finalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid service data",
      });
    }

    // ✅ Add to bill
    bill.items.push({
      name: finalName,
      price: finalPrice,
    });

    // ✅ Recalculate total
    bill.totalAmount = bill.items.reduce(
      (sum, item) => sum + item.price,
      0
    );

    await bill.save();

    res.json({
      success: true,
      bill,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= CONFIRM PAYMENT =================
exports.confirmPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paidAmount } = req.body;

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (paidAmount < bill.totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Amount must be full",
      });
    }

    bill.paidAmount = paidAmount;
    bill.paymentStatus = "Paid";
    bill.paymentDate = new Date();

    await bill.save();

    res.json({ success: true, bill });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ================= GET BILLS =================
exports.getBills = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = parseInt(req.query.limit) || 10; // default 10 bills per page
  const skip = (page - 1) * limit;

  try {
    const totalBills = await Bill.countDocuments();
    const bills = await Bill.find()
      .populate("appointmentId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      bills,
      totalPages: Math.ceil(totalBills / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ================= GET BILL =================
exports.getBillById = async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate("appointmentId");

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  res.json({ success: true, bill });
};