const AdminUser = require("../models/adminUser.model");

/* =========================
   GET ADMIN PROFILE
========================= */
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.user.id).select(
      "name username email phone bio profilePic role status createdAt"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ success: true, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE ADMIN PROFILE
========================= */
exports.updateAdminProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      username: req.body.username,
      phone: req.body.phone,
      bio: req.body.bio,
    };

    // ❌ EMAIL SHOULD NOT BE UPDATED
    // so we don't include email here

    // 🖼️ Upload new profile pic
    if (req.file) {
      updates.profilePic = `/uploads/profile/${req.file.filename}`;
    }

    // 🗑️ DELETE PROFILE PIC
    if (req.body.removeProfilePic === "true") {
      updates.profilePic = null;
    }

    const admin = await AdminUser.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    );

    res.json({ success: true, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile update failed" });
  }
};