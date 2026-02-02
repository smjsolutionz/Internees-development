// backend/scripts/createAdmin.js
// Run this to create an admin user

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../src/models/User"); // Adjust path if needed

const createAdmin = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin user details
    const adminData = {
      name: "Admin",
      email: "admin@diamondtrim.com",
      password: "admin123", // Change this to a secure password
      phone: "03001234567",
      role: "admin",
      isVerified: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);

      // Update password if needed
      const updatePassword = true; // Set to true if you want to reset password
      if (updatePassword) {
        const salt = await bcrypt.genSalt(10);
        existingAdmin.password = await bcrypt.hash(adminData.password, salt);
        await existingAdmin.save();
        console.log("✅ Password updated!");
      }

      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", adminData.password);
    console.log("👤 Role:", admin.role);
    console.log("");
    console.log("⚠️ IMPORTANT: Change the password after first login!");
    console.log("");
    console.log("🚀 You can now login with these credentials");

    await mongoose.connection.close();
    console.log("✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
