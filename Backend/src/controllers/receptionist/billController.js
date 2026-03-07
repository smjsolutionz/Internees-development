const Bill = require("../../models/Bill");
const Appointment = require("../../models/Appointment");
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

  const existingBill = await Bill.findOne({ appointmentId });

  if (existingBill) {
    return res.status(400).json({
      success: false,
      message: "Bill already exists for this appointment",
    });
  }

  const item = appointment.package || appointment.service;

  if (!item) {
    return res.status(400).json({
      success: false,
      message: "No service or package found",
    });
  }

  // Remove everything except digits and dot, then convert to number
const rawPrice = item.price || item.pricing || 0;
const totalAmount = Number(String(rawPrice).replace(/[^0-9.]/g, ""));

  const bill = await Bill.create({
    billNumber: generateBillNumber(),
    appointmentId,
    customerName: appointment.customerName,
    serviceName: item.name,
    totalAmount
  });

  res.status(201).json({
    success: true,
    message: "Bill generated successfully",
    bill
  });

} catch (error) {

  console.error("Generate Bill Error:", error);

  res.status(500).json({
    success: false,
    message: error.message
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
      message: "Paid amount must be equal or greater than total",
    });
  }

  bill.paidAmount = paidAmount;
  bill.paymentStatus = "Paid";
  bill.paymentDate = new Date();

  await bill.save();

  res.json({
    success: true,
    message: "Payment confirmed",
    bill,
  });

} catch (error) {

  res.status(500).json({
    success: false,
    message: "Server error",
  });

}

};


// ================= GET ALL BILLS =================

exports.getBills = async (req, res) => {

try {

  const bills = await Bill.find()
    .populate("appointmentId")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    bills,
  });

} catch (error) {

  res.status(500).json({
    success: false,
    message: "Server error",
  });

}

};


// ================= GET BILL BY ID =================

exports.getBillById = async (req, res) => {

try {

  const bill = await Bill.findById(req.params.id)
    .populate("appointmentId");

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: "Bill not found",
    });
  }

  res.json({
    success: true,
    bill,
  });

} catch (error) {

  res.status(500).json({
    success: false,
    message: "Server error",
  });

}

};