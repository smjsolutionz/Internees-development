const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    CUSTOMER: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow guest bookings
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    duration: {
      type: String, // minutes
      default: 60,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    notes: { type: String, maxlength: 500 },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    price: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancellationReason: String,
    cancelledAt: Date,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    confirmedAt: Date,
  },
  { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ customer: 1, appointmentDate: 1 });
appointmentSchema.index({ staff: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
