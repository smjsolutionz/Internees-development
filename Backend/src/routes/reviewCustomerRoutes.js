const express = require("express");
const router = express.Router();

const {
  submitReview,
  editReview,
  deleteReview,
getFeaturedReviews,
  getReviewsForTarget

} = require("../controllers/reviewCustomerController");

const { protect, authorizeRoles } = require("../middleware/reviewAuth");

/* =========================
   🔓 PUBLIC ROUTES
   ========================= */

// Home page – featured reviews (NO LOGIN)
router.get("/featured", getFeaturedReviews);

// Reviews for a service or package (NO LOGIN)
router.get("/target/:targetType/:targetId", getReviewsForTarget);

/* =========================
   🔐 PROTECTED ROUTES
   ========================= */

router.use(protect, authorizeRoles(["CUSTOMER"]));

router.post("/", submitReview);
router.put("/:id", editReview);
router.delete("/:id", deleteReview);


module.exports = router;
