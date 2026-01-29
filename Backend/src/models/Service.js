const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Hair Cut",
        "Hair Color",
        "Facial",
        "Massage",
        "Manicure",
        "Pedicure",
        "Makeup",
        "Other",
      ],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      default: 60,
    },
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    availableForBooking: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ✅ Prevent model overwrite error
module.exports =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
