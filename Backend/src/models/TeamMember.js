const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"], // optional validation
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true, // ensures no duplicate emails
      match: [/.+\@.+\..+/, "Please enter a valid email"], // basic email validation
    },

    specialty: {
      type: String,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
    },

   


    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
