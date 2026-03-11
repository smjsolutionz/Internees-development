const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const AdminUser = require("../models/adminUser.model");


// =========================
// GET PROFILE
// =========================
router.get("/profile", protect, async (req, res) => {
  try {

    // 🔑 FIX: get correct id from middleware
    const userId = req.user.id || req.user._id;

    // First check in User collection
    let user = await User.findById(userId).select("-password -refreshTokens");

    // If not found, check in AdminUser collection
    if (!user) {
      user = await AdminUser.findById(userId).select("-password_hash");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send safe data
    const safeUser = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar || user.profilePic || user.profileImage || ""
    };

    res.json(safeUser);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// =========================
// UPDATE PROFILE
// =========================
router.put("/profile", protect, async (req, res) => {
  try {

    const { name, username, phone } = req.body;

    // 🔑 FIX: correct id
    const userId = req.user.id || req.user._id;

    let user = await User.findById(userId);

    if (!user) {
      user = await AdminUser.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.username = username || user.username;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;