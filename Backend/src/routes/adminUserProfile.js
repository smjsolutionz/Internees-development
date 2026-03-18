const express = require("express");
const router = express.Router();
const adminProtect = require("../middleware/adminProtect");

// GET profile
router.get("/profile", adminProtect, async (req, res) => {
  const user = req.user;
  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.profilePic || "",
  });
});

// PUT profile
router.put("/profile", adminProtect, async (req, res) => {
  const { name, username, phone } = req.body;
  const user = req.user;

  user.name = name || user.name;
  user.username = username || user.username;
  user.phone = phone || user.phone;

  await user.save();
  res.json({ message: "Profile updated successfully", user });
});

module.exports = router;