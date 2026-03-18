// controllers/billController.js
const Bill = require("../../models/Bill");
const Appointment = require("../../models/Appointment");
const Package = require("../../models/Package");
const generateBillNumber = require("../../utils/generateBillNumber");

// ---------------- GENERATE BILL ----------------
exports.generateBill = async (req, res) => {
  try {
    const { appointmentId, force } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate("service")
      .populate("package");

    if (!appointment)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    if (!appointment.service && !appointment.package)
      return res.status(400).json({ success: false, message: "No service or package found" });

    // Check existing bill
    let existingBill = await Bill.findOne({ appointmentId });
    if (existingBill && !force && existingBill.paidAmount > 0)
      return res.status(400).json({ success: false, message: "Bill already exists and is paid" });

    if (existingBill) await existingBill.deleteOne();

    // Combine service + package names
    const serviceName = [
      appointment.service ? appointment.service.name : null,
      appointment.package ? appointment.package.name : null,
    ].filter(Boolean).join(" + ");

    // Total amount: sum service and package price if both exist
    const totalAmount =
      (appointment.service?.price || 0) + (appointment.package?.price || 0);

    const bill = await Bill.create({
      billNumber: generateBillNumber(),
      appointmentId,
      customerName: appointment.customerName,
      serviceName, // combined name
      packageName: appointment.package ? appointment.package._id : null,
      totalAmount,
    });

    appointment.bill = bill._id;
    await appointment.save();

    res.status(201).json({ success: true, message: "Bill generated successfully", bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- CONFIRM PAYMENT ----------------
exports.confirmPayment = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paidAmount } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    bill.paidAmount = paidAmount;
    bill.paymentStatus = paidAmount >= bill.totalAmount ? "Paid" : "Unpaid";
    bill.paymentDate = new Date();
    await bill.save();

    res.json({ success: true, message: "Payment updated", bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET ALL BILLS ----------------
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("appointmentId")
      .sort({ createdAt: -1 });

    res.json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- GET BILL BY ID ----------------
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("appointmentId");
    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });

    res.json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

