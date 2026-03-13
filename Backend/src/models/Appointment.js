const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    appointmentDate: Date,
    appointmentTime: String,
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);