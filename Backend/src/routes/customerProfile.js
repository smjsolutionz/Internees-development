// routes/admin.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

router.get("/profile", protect, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password -refreshTokens");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, username, email, phone } = req.body;

    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.name = name || admin.name;
    admin.username = username || admin.username;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;

    await admin.save();
    res.json({ message: "Profile updated successfully", admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;