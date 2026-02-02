const express = require("express");
const router = express.Router();

const { adminRequireAuth } = require("../middleware/adminAuth.middleware");
const upload = require("../middleware/upload.middleware");

const {
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminProfileController");

/* =========================
   GET PROFILE
========================= */
router.get("/profile", adminRequireAuth, getAdminProfile);

/* =========================
   UPDATE PROFILE
========================= */
router.put(
  "/profile",
  adminRequireAuth,
  (req, res, next) => {
    req.folder = "uploads/profile";
    next();
  },
  upload.single("profilePic"),
  updateAdminProfile
);

module.exports = router;