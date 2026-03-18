const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
{
  billNumber: {
    type: String,
    required: true,
    unique: true,
  },

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },

  customerName: {
    type: String,
    required: true,
  },

  // ✅ MULTIPLE SERVICES
  items: [
    {
      name: String,
      price: Number,
    }
  ],

  totalAmount: {
    type: Number,
    required: true,
  },

  paidAmount: {
    type: Number,
    default: 0,
  },

  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Paid"],
    default: "Unpaid",
  },

  paymentDate: Date,

},
{ timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);