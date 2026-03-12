const AdminTeamMember = require("../models/TeamMember");
const AdminUser = require("../models/adminUser.model");
const path = require("path");

// ➕ Add new team member
exports.addAdminTeamMember = async (req, res) => {
  try {
    const { name, role, bio, status, specialty, email } = req.body;

    // 1️⃣ Check if email exists in AdminUser
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) {
      return res.status(400).json({ message: "No admin user found with this email" });
    }

    // 2️⃣ Check if role matches AdminUser role
    if (adminUser.role !== role) {
      return res.status(400).json({ message: `Role mismatch: AdminUser role is ${adminUser.role}` });
    }

    // 3️⃣ Check duplicate email in TeamMember table
    const existingMember = await AdminTeamMember.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ message: "Email already exists in team members" });
    }

    const profileImage = req.file ? path.join("team", req.file.filename) : null;

    const newMember = new AdminTeamMember({
      name,
      role,
      bio,
      status,
      specialty,
      email,
      profileImage,
    });

    await newMember.save();
    res.status(201).json({ message: "Admin team member added", member: newMember });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Edit existing team member
exports.editAdminTeamMember = async (req, res) => {
  try {
    const { name, role, bio, status, specialty, email } = req.body;
    const id = req.params.id;

    // 1️⃣ Check if email exists in AdminUser
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) {
      return res.status(400).json({ message: "No admin user found with this email" });
    }

    // 2️⃣ Check if role matches AdminUser role
    if (adminUser.role !== role) {
      return res.status(400).json({ message: `Role mismatch: AdminUser role is ${adminUser.role}` });
    }

    // 3️⃣ Check duplicate email in TeamMember table (excluding current member)
    const existingMember = await AdminTeamMember.findOne({ email, _id: { $ne: id } });
    if (existingMember) {
      return res.status(400).json({ message: "Email already exists in team members" });
    }

    const profileImage = req.file ? path.join("team", req.file.filename) : undefined;

    const updateData = { name, role, bio, status, specialty, email };
    if (profileImage) updateData.profileImage = profileImage;

    const updatedMember = await AdminTeamMember.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: "Admin team member updated", member: updatedMember });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Hard delete team member
exports.deleteAdminTeamMember = async (req, res) => {
  try {
    const deletedMember = await AdminTeamMember.findByIdAndDelete(req.params.id);

    if (!deletedMember) {
      return res.status(404).json({ message: "Admin team member not found" });
    }

    res.json({ message: "Admin team member permanently deleted", member: deletedMember });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 Get all team members
exports.getAllAdminTeamMembers = async (req, res) => {
  try {
    const members = await AdminTeamMember.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
