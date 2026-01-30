const AdminTeamMember = require("../models/TeamMember");
const path = require("path");

// Add new admin team member
exports.addAdminTeamMember = async (req, res) => {
  try {
    const { name, role, bio, status, specialty } = req.body;
    const profileImage = req.file ? path.join("team", req.file.filename) : null;

    const newMember = new AdminTeamMember({ name, role, bio, status, specialty, profileImage });
    await newMember.save();
    res.status(201).json({ message: "Admin team member added", member: newMember });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all admin team members
exports.getAllAdminTeamMembers = async (req, res) => {
  try {
    const members = await AdminTeamMember.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit admin team member
exports.editAdminTeamMember = async (req, res) => {
  try {
    const { name, role, bio, status, specialty } = req.body;
    const profileImage = req.file ? path.join("team", req.file.filename) : undefined;

    const updateData = { name, role, bio, status, specialty };
    if (profileImage) updateData.profileImage = profileImage;

    const updatedMember = await AdminTeamMember.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Admin team member updated", member: updatedMember });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete admin team member
// Hard delete admin team member
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

