const AdminUser = require("../models/adminUser.model");

/* =========================
   GET PROFILE BASED ON ROLE
========================= */

exports.getAdminProfile = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    let profileData = {};

    switch (req.user.role) {
      case "ADMIN":
        profileData = {
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          profilePic: user.profilePic,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        };
        break;

      case "MANAGER":
      case "INVENTORY_MANAGER":
      case "STAFF":
      case "RECEPTIONIST":
        profileData = {
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        };
        break;

      case "CUSTOMER":
      default:
        profileData = {
          name: user.name,
          username: user.username,
        };
        break;
    }

    res.json({ success: true, user: profileData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   UPDATE PROFILE
========================= */
exports.updateAdminProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      username: req.body.username,
      phone: req.body.phone,
      bio: req.body.bio,
    };

    if (req.file) {
      updates.profilePic = `/uploads/profile/${req.file.filename}`;
    }

    if (req.body.removeProfilePic === "true") {
      updates.profilePic = null;
    }

    const admin = await AdminUser.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    });

    res.json({ success: true, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
};
