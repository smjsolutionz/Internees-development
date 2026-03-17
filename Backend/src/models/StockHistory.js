const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      enum: ["SERVICE_USAGE", "DAMAGE", "PURCHASE", "ADJUSTMENT"],
      default: "PURCHASE",
    },
    beforeStock: {
      type: Number,
      required: true,
      min: 0,
    },
    afterStock: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);

