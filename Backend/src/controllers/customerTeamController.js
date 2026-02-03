const AdminTeamMember = require("../models/TeamMember");

// Get active members for customers
exports.getActiveAdminTeamMembers = async (req, res) => {
  try {
    const members = await AdminTeamMember.find({ status: "Active" });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
