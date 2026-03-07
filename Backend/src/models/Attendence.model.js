const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeRole: {
      type: String,
      enum: ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Present", "Leave", "Absent", "Missed Checkout", "Late Checkout"],
      default: "Absent",
    },
    leaveType: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", ""],
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
