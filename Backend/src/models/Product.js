const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumStock: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    status: {
      type: String,
      enum: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"],
      default: "IN_STOCK",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.methods.computeStatus = function () {
  if (this.currentStock <= 0) return "OUT_OF_STOCK";
  if (this.currentStock <= this.minimumStock) return "LOW_STOCK";
  return "IN_STOCK";
};

productSchema.pre("save", function (next) {
  this.status = this.computeStatus();
  next();
});

module.exports = mongoose.model("Product", productSchema);

