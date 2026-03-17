const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }], // <-- ARRAY
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    appointmentDate: Date,
    appointmentTime: String,
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);