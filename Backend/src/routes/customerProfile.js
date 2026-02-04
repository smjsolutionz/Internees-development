const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
// your existing middleware
const User = require("../models/User"); // use the existing User model

// GET /api/customer/profile
router.get("/profile", protect, async (req, res) => {
  try {
    const customer = await User.findById(req.user._id).select("-password -refreshTokens");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/customer/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, avatar, username, email } = req.body;

    const customer = await User.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    customer.avatar = avatar || customer.avatar;
    customer.username = username || customer.username;
    customer.email = email || customer.email;

    await customer.save();

    res.json({
      message: "Profile updated successfully",
      customer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
