const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerTeamController");

// Customer route
router.get("/team", customerController.getActiveAdminTeamMembers);

module.exports = router;
