import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingDrawer from "./BookingDrawer";
import {
  FaArrowRight,
  FaStar,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaSort,
  FaClock,
  FaDollarSign,
  FaTag,
} from "react-icons/fa";

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(4);
  const [ratingInput, setRatingInput] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New states for better review management
  const [sortBy, setSortBy] = useState("latest");
  const [filterRating, setFilterRating] = useState(0);
  const [expandedReview, setExpandedReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: [],
  });

  // Edit modal state
  const [editReview, setEditReview] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  const descRef = useRef(null);
  const token = localStorage.getItem("accessToken");

  /* ================= AUTH ================= */
  const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload._id || payload.id || null;
    } catch {
      return null;
    }
  };

  const userId = getUserIdFromToken(token);
  const loggedIn = !!userId;

  /* ================= FETCH SERVICE ================= */
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/customer/services/${id}`,
        );
        if (res.data?.success) setService(res.data.data);
      } catch (err) {
        console.error("❌ Service fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/target/Service/${id}`,
      );
      if (res.data?.success) {
        const reviewsData = res.data.reviews;
        setReviews(reviewsData);

        // Calculate review statistics
        if (reviewsData.length > 0) {
          const total = reviewsData.length;
          const sum = reviewsData.reduce(
            (acc, review) => acc + review.rating,
            0,
          );
          const average = (sum / total).toFixed(1);

          // Calculate rating distribution
          const distribution = [0, 0, 0, 0, 0];
          reviewsData.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
              distribution[5 - review.rating]++;
            }
          });

          setReviewStats({
            average,
            total,
            distribution,
          });
        } else {
          setReviewStats({ average: 0, total: 0, distribution: [] });
        }
      }
    } catch (err) {
      console.error("❌ Review fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  /* ================= ADD REVIEW ================= */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!ratingInput || !messageInput.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews`,
        {
          targetType: "Service",
          targetId: id,
          rating: ratingInput,
          message: messageInput,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRatingInput(0);
      setMessageInput("");
      setShowReviewForm(false);
      fetchReviews();
    } catch (err) {
      console.error("❌ Add review failed:", err.response || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT REVIEW ================= */
  const submitEditReview = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/${editReview._id}`,
        { message: editMessage },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditReview(null);
      fetchReviews();
    } catch (err) {
      console.error("❌ Edit review failed:", err.response || err.message);
    }
  };

  /* ================= DELETE REVIEW ================= */
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchReviews();
    } catch (err) {
      console.error("❌ Delete review failed:", err.response || err.message);
    }
  };

  /* ================= SORT AND FILTER REVIEWS ================= */
  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews];

    if (filterRating > 0) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    switch (sortBy) {
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "latest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt) -
            new Date(a.createdAt || a.updatedAt),
        );
        break;
    }

    return filtered;
  };

  /* ================= PAGINATION ================= */
  const filteredReviews = getFilteredAndSortedReviews();
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview,
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  /* ================= RENDER RATING BARS ================= */
  const renderRatingBars = () => {
    if (reviewStats.total === 0) return null;

    return (
      <div className="space-y-2 mb-6">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviewStats.distribution[5 - star] || 0;
          const percentage =
            reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;

          return (
            <div
              key={star}
              className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors"
            >
              <div className="flex items-center gap-1 w-14">
                <span className="text-sm font-medium w-3">{star}</span>
                <FaStar className="text-yellow-400" size={14} />
              </div>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 font-medium w-10 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#BB8C4B]"></div>
      </div>
    );

  if (!service)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Service not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto container pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        {/* ===== SERVICE HEADER ===== */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 transform hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row">
            {/* Image Section */}
            <div className="lg:w-1/2 h-[400px] lg:h-[500px] relative overflow-hidden group">
              {service.images?.[0] ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/${service.images[0]}`}
                  alt={service.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-9xl">
                  💈
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              {/* Category Badge */}
              {service.category && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                    <FaTag size={12} />
                    {service.category}
                  </span>
                </div>
              )}

              {/* Service Name */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {service.name}
              </h1>

              {/* Rating Summary */}
              {reviewStats.total > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.floor(reviewStats.average)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                        size={20}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {reviewStats.average}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewStats.total} reviews)
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {service.description}
              </p>

              {/* Service Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {service.duration && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FaClock className="text-[#BB8C4B]" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Duration
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {service.duration}
                      </p>
                    </div>
                  </div>
                )}
                {service.pricing && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FaDollarSign className="text-[#BB8C4B]" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {service.pricing}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Book Now</span>
                <FaArrowRight
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                  size={16}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#D79A4A] to-[#BB8C4B] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* ===== REVIEWS SECTION ===== */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          {/* Reviews Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Customer Reviews
              </h2>
              {reviewStats.total > 0 && (
                <p className="text-gray-600">
                  Based on {reviewStats.total} verified reviews
                </p>
              )}
            </div>

            {loggedIn && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && loggedIn && (
            <div className="mb-10 p-8 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-md animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Share Your Experience
                </h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitReview}>
                {/* Rating Stars */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar
                        key={s}
                        className={`cursor-pointer transition-all duration-200 ${
                          ratingInput >= s
                            ? "text-yellow-400 scale-110"
                            : "text-gray-300 hover:text-yellow-200"
                        }`}
                        onClick={() => setRatingInput(s)}
                        size={36}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Message */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your Review
                  </label>
                  <textarea
                    className="border-2 border-gray-200 w-full p-4 rounded-xl text-base focus:border-[#BB8C4B] focus:ring-2 focus:ring-[#BB8C4B]/20 transition-all outline-none resize-none"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Tell us about your experience with this service..."
                    rows={5}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={
                      submitting || !ratingInput || !messageInput.trim()
                    }
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* No Reviews State */}
          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-xl text-gray-600 mb-6">
                No reviews yet. Be the first to review this service!
              </p>
              {loggedIn && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Write First Review
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* LEFT: Rating Summary and Filters */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  {/* Average Rating */}
                  <div className="text-center mb-8 pb-6 border-b">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {reviewStats.average}
                    </div>
                    <div className="flex justify-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.floor(reviewStats.average)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                          size={20}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Based on {reviewStats.total} reviews
                    </p>
                  </div>

                  {/* Rating Distribution */}
                  {renderRatingBars()}

                  {/* Filter by Rating */}
                  <div className="mb-6 pb-6 border-b">
                    <div className="flex items-center text-sm font-semibold mb-3 text-gray-700">
                      <FaFilter className="mr-2" size={14} />
                      Filter by Rating
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterRating(0)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          filterRating === 0
                            ? "bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-[#BB8C4B]"
                        }`}
                      >
                        All
                      </button>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFilterRating(rating)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-1 transition-all ${
                            filterRating === rating
                              ? "bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white shadow-md"
                              : "bg-white border border-gray-300 text-gray-700 hover:border-[#BB8C4B]"
                          }`}
                        >
                          {rating} <FaStar size={12} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <div className="flex items-center text-sm font-semibold mb-3 text-gray-700">
                      <FaSort className="mr-2" size={14} />
                      Sort by
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-[#BB8C4B] focus:ring-2 focus:ring-[#BB8C4B]/20 transition-all outline-none cursor-pointer"
                    >
                      <option value="latest">Latest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RIGHT: Reviews List */}
              <div className="lg:col-span-3">
                {/* Filter Info */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">
                    Showing {indexOfFirstReview + 1}-
                    {Math.min(indexOfLastReview, filteredReviews.length)} of{" "}
                    {filteredReviews.length} reviews
                    {filterRating > 0 && (
                      <span className="ml-1">
                        • Filtered by {filterRating} star
                        {filterRating > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {currentReviews.map((r, index) => {
                    const isOwner = r.CUSTOMER?._id === userId;
                    const isExpanded = expandedReview === r._id;

                    return (
                      <div
                        key={r._id}
                        className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 bg-white animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BB8C4B] to-[#D79A4A] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                              {r.CUSTOMER?.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>

                            {/* Review Info */}
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <strong className="text-gray-900 text-lg">
                                  {r.CUSTOMER?.name || "Anonymous"}
                                </strong>
                                <div className="flex text-yellow-400">
                                  {[...Array(r.rating)].map((_, i) => (
                                    <FaStar key={i} size={16} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )
                                  : "Recently"}
                              </p>
                            </div>
                          </div>

                          {/* Edit/Delete Actions */}
                          {isOwner && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setEditReview(r);
                                  setEditMessage(r.message);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <FaEdit size={18} />
                              </button>
                              <button
                                onClick={() => deleteReview(r._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTrash size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Review Message */}
                        <div className="mt-4">
                          <p
                            className={`text-gray-700 leading-relaxed ${
                              !isExpanded && r.message.length > 150
                                ? "line-clamp-3"
                                : ""
                            }`}
                          >
                            {r.message}
                          </p>

                          {r.message.length > 150 && (
                            <button
                              onClick={() =>
                                setExpandedReview(isExpanded ? null : r._id)
                              }
                              className="text-[#BB8C4B] font-medium text-sm mt-2 flex items-center gap-1 hover:text-[#D79A4A] transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  Show less <FaChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  Read more <FaChevronDown size={14} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredReviews.length > reviewsPerPage && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-8 border-t-2">
                    <div className="text-sm text-gray-600 font-medium mb-4 sm:mb-0">
                      Page {currentPage} of {totalPages}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#BB8C4B] hover:text-[#BB8C4B]"
                        }`}
                      >
                        Previous
                      </button>

                      <div className="flex gap-2">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={i}
                                onClick={() => paginate(pageNum)}
                                className={`w-11 h-11 rounded-lg font-semibold transition-all ${
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white shadow-md"
                                    : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#BB8C4B]"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2 text-gray-400">...</span>
                            <button
                              onClick={() => paginate(totalPages)}
                              className="w-11 h-11 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-[#BB8C4B] transition-all"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#BB8C4B] hover:text-[#BB8C4B]"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl transform animate-scaleIn">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Edit Your Review
            </h3>
            <div className="flex gap-1 mb-6">
              {[...Array(editReview.rating)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" size={24} />
              ))}
            </div>
            <textarea
              className="border-2 border-gray-200 w-full p-4 rounded-xl focus:border-[#BB8C4B] focus:ring-2 focus:ring-[#BB8C4B]/20 transition-all outline-none resize-none"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setEditReview(null)}
                className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEditReview}
                className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        service={service.name}
      />

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ServiceDetails;
