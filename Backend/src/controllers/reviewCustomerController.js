const Review = require("../models/Review");

// Submit a review
exports.submitReview = async (req, res) => {
  const { targetType, targetId, rating, message } = req.body;
  if (!targetType || !targetId || !rating || !message)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const review = await Review.create({
      customer: req.user._id,
      targetType,
      targetId,
      rating,
      message,
    });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit review
exports.editReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  if (!review.customer.equals(req.user._id))
    return res.status(403).json({ message: "Cannot edit others' reviews" });

  review.rating = req.body.rating || review.rating;
  review.message = req.body.message || review.message;

  await review.save();
  res.json({ success: true, review });
};

// Delete review
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  if (!review.customer.equals(req.user._id))
    return res.status(403).json({ message: "Cannot delete others' reviews" });

  await review.deleteOne();
  res.json({ success: true, message: "Review deleted" });
};

// controllers/reviewCustomerController.js
exports.getFeaturedReviews = async (req, res) => {
  try {
    const featuredReviews = await Review.find()
      .sort({ rating: -1, createdAt: -1 }) // top-rated first, newest first
      .limit(10) // show top 10
      .populate("customer", "name") // reviewer name
      .populate("targetId", "name type"); // package/service name

    res.json({ success: true, featuredReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all reviews for a target (package or service) — all reviews visible
exports.getReviewsForTarget = async (req, res) => {
  const { targetType, targetId } = req.params;
  if (!targetType || !targetId)
    return res.status(400).json({ message: "targetType and targetId required" });

  try {
    const reviews = await Review.find({ targetType, targetId })
      .sort({ createdAt: -1 })
      .populate("customer", "name"); // show reviewer name

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
