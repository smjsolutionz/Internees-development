// fixCustomerRole.js
const mongoose = require("mongoose");

// Replace with your actual MongoDB URI
const DB_URI = "mongodb://127.0.0.1:27017/salonDB";

// Import your User model (adjust path if needed)
const User = require("./src/models/User");

mongoose.connect(DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

async function fixRoles() {
  try {
    const result = await User.updateMany(
      { role: "customer" },    // lowercase role
      { $set: { role: "CUSTOMER" } }  // fix to uppercase
    );
    console.log("Updated users:", result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

fixRoles();