const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    customerName: { type: String, required: true },
    serviceName: { type: String, required: true }, // combined service + package
    packageName: { type: mongoose.Schema.Types.ObjectId, ref: "Package", default: null },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
    paymentDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);