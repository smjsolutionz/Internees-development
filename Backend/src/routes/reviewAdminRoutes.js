const express = require("express");
const router = express.Router();
const {
  getAllReviews,
 
  deleteReview,
} = require("../controllers/reviewAdminController");
const { protect, authorizeRoles } = require("../middleware/reviewAuth");

router.use(protect, authorizeRoles(["ADMIN"]));

router.get("/", getAllReviews);

router.delete("/:id", deleteReview);

module.exports = router;
