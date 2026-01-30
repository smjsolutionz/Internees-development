const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminTeamController");
const upload = require("../middleware/upload.middleware");

// Middleware to set upload folder
const setAdminTeamFolder = (req, res, next) => {
  req.folder = "uploads/team"; 
  next();
};

// Admin CRUD routes
router.post("/team", setAdminTeamFolder, upload.single("profileImage"), adminController.addAdminTeamMember);
router.get("/team", adminController.getAllAdminTeamMembers);
router.put("/team/:id", setAdminTeamFolder, upload.single("profileImage"), adminController.editAdminTeamMember);
router.delete("/team/:id", adminController.deleteAdminTeamMember);

module.exports = router;
