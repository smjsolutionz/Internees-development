const Review = require("../models/Review");

// Get all reviews (with optional type filter)
exports.getAllReviews = async (req, res) => {
  const { type } = req.query; // PACKAGE or SERVICE
  const filter = type ? { targetType: type } : {};

  const reviews = await Review.find(filter)
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
};



// Delete review
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });

  await review.deleteOne();
  res.json({ success: true, message: "Review deleted" });
};
