const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      trim: true
    },

    // Free text – admin jo chahay likh sakta hai
    specialty: {
      type: String,
      trim: true,
      default: ""
    },

    profileImage: {
      type: String
    },

    bio: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
