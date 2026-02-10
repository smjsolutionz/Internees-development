import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingDrawer from "./BookingDrawer";
import { FaArrowRight, FaStar, FaTrash, FaEdit, FaChevronDown, FaChevronUp, FaFilter, FaSort } from "react-icons/fa";

const PackageDetail = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(4);
  const [ratingInput, setRatingInput] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New states for better review management
  const [sortBy, setSortBy] = useState("latest"); // "latest", "highest", "lowest"
  const [filterRating, setFilterRating] = useState(0); // 0 = all, 1-5 = filter by rating
  const [expandedReview, setExpandedReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: [] });

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

  /* ================= FETCH PACKAGE ================= */
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/packages/${id}`);
        setPkg(res.data.data || res.data.package);
      } catch (err) {
        console.error("❌ Package fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  /* ================= FETCH REVIEWS ================= */
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/customer/reviews/target/Package/${id}`
      );
      if (res.data?.success) {
        const reviewsData = res.data.reviews;
        setReviews(reviewsData);
        
        // Calculate review statistics
        if (reviewsData.length > 0) {
          const total = reviewsData.length;
          const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
          const average = (sum / total).toFixed(1);
          
          // Calculate rating distribution
          const distribution = [0, 0, 0, 0, 0]; // 5,4,3,2,1 stars
          reviewsData.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
              distribution[5 - review.rating]++; // 5-star at index 0
            }
          });
          
          setReviewStats({
            average,
            total,
            distribution
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
        `http://localhost:5000/api/customer/reviews`,
        {
          targetType: "Package",
          targetId: id,
          rating: ratingInput,
          message: messageInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
        `http://localhost:5000/api/customer/reviews/${editReview._id}`,
        { message: editMessage },
        { headers: { Authorization: `Bearer ${token}` } }
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
        `http://localhost:5000/api/customer/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      console.error("❌ Delete review failed:", err.response || err.message);
    }
  };

  /* ================= SORT AND FILTER REVIEWS ================= */
  const getFilteredAndSortedReviews = () => {
    let filtered = [...reviews];
    
    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }
    
    // Sort reviews
    switch(sortBy) {
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
        break;
    }
    
    return filtered;
  };

  /* ================= PAGINATION ================= */
  const filteredReviews = getFilteredAndSortedReviews();
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
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
      <div className="space-y-2 mb-4">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviewStats.distribution[5 - star] || 0;
          const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center hover:bg-gray-50 p-1 rounded transition-colors">
              <div className="flex items-center w-16">
                <span className="text-sm w-4 font-medium">{star}</span>
                <FaStar className="text-yellow-400 ml-1" size={12} />
              </div>
              <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden ml-2">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 ml-2 w-8 font-medium">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#c0954d]"></div>
    </div>
  );
  
  if (!pkg) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl text-gray-600">Package not found</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pt-28 px-4 pb-16">
      {/* ===== PACKAGE UI ===== */}
      <div className="flex flex-col md:flex-row gap-10 mb-16">
        <div className="md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group">
          <img
            src={`http://localhost:5000/${pkg.image}`}
            alt={pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">{pkg.name}</h1>

          <div className="flex items-center gap-6 py-4 border-y border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700 font-medium">{pkg.totalDuration}</p>
            </div>
            <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#c0954d] to-[#d4a75f] bg-clip-text text-transparent">{pkg.price}/-</span>
          </div>

          <div ref={descRef} className="mt-2">
            <p className="text-gray-600 leading-relaxed line-clamp-4">{pkg.description || "No description available"}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Included Services</h3>
            <ul className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-sm">
              {pkg.services?.map((service, index) => (
                <li 
                  key={service._id} 
                  className="flex justify-between items-center py-3 border-b last:border-b-0 border-gray-200 hover:bg-gray-50 px-2 rounded transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#c0954d] rounded-full"></div>
                    <span className="font-medium text-gray-800">{service.name}</span>
                  </div>
                  {service.price && (
                    <span className="text-[#c0954d] font-semibold">{service.price}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="mt-6 max-h-12 max-w-60 px-6 py-3 bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white font-semibold hover:from-[#d4a75f] hover:to-[#c0954d] flex items-center justify-center gap-2 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Book This Package <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ===== REVIEWS SECTION ===== */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b-2 border-gray-100">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            {reviewStats.total > 0 && (
              <p className="text-gray-600 mt-1">
                Based on {reviewStats.total} verified review{reviewStats.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {loggedIn && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white font-semibold rounded-lg hover:from-[#d4a75f] hover:to-[#c0954d] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              {reviews.length === 0 ? "Write First Review" : "Write a Review"}
            </button>
          )}
        </div>

        {showReviewForm && loggedIn && (
          <div className="mb-8 p-6 lg:p-8 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Share Your Experience</h3>
              <button 
                onClick={() => setShowReviewForm(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      className={`cursor-pointer transition-all duration-200 ${ratingInput >= s ? "text-yellow-400 scale-110" : "text-gray-300 hover:text-yellow-200"}`}
                      onClick={() => setRatingInput(s)}
                      size={32}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Review</label>
                <textarea
                  className="border-2 border-gray-200 w-full p-4 rounded-xl text-base focus:border-[#c0954d] focus:ring-2 focus:ring-[#c0954d]/20 transition-all outline-none resize-none"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Share your experience with this package..."
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#d4a75f] hover:to-[#c0954d] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={submitting || !ratingInput || !messageInput.trim()}
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Rating Summary and Filters */}
          <div className="lg:w-1/4">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 shadow-sm sticky top-24">
              {/* Average Rating */}
              <div className="text-center mb-8 pb-6 border-b border-gray-200">
                <div className="text-5xl font-bold text-gray-900 mb-2">{reviewStats.average || 0}</div>
                <div className="flex justify-center my-3 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(reviewStats.average) ? "text-yellow-400" : "text-gray-300"} 
                      size={20}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-medium">{reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}</p>
              </div>
              
              {/* Rating Distribution */}
              {reviewStats.total > 0 && renderRatingBars()}
              
              {/* Filter by Rating */}
              {reviewStats.total > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center text-sm font-semibold mb-3 text-gray-700">
                    <FaFilter className="mr-2" size={12} />
                    Filter by Rating
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterRating(0)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterRating === 0 ? 'bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#c0954d]'}`}
                    >
                      All
                    </button>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1 transition-all ${filterRating === rating ? 'bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#c0954d]'}`}
                      >
                        {rating} <FaStar size={10} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sort Options */}
              {reviewStats.total > 0 && (
                <div>
                  <div className="flex items-center text-sm font-semibold mb-3 text-gray-700">
                    <FaSort className="mr-2" size={12} />
                    Sort by
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-[#c0954d] focus:ring-2 focus:ring-[#c0954d]/20 transition-all outline-none cursor-pointer"
                  >
                    <option value="latest">Latest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              )}
            </div>
          </div>
            
          {/* RIGHT: Reviews List with Pagination */}
          <div className="lg:w-3/4">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-6xl mb-4">⭐</div>
                <p className="text-xl text-gray-600 mb-6">No reviews yet. Be the first to review this package!</p>
                {loggedIn && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white font-semibold rounded-lg hover:from-[#d4a75f] hover:to-[#c0954d] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Write First Review
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Reviews Count and Filter Info */}
                <div className="mb-6 text-sm text-gray-600 font-medium">
                  Showing {indexOfFirstReview + 1}-{Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} reviews
                  {filterRating > 0 && ` • Filtered by ${filterRating} star${filterRating > 1 ? 's' : ''}`}
                </div>
                
                {/* Reviews List */}
                <div className="space-y-4">
                  {currentReviews.map((r, index) => {
                    const isOwner = r.CUSTOMER?._id === userId;
                    const isExpanded = expandedReview === r._id;
                    
                    return (
                      <div
                        key={r._id}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 bg-white"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c0954d] to-[#d4a75f] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                              {r.CUSTOMER?.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
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
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'}
                              </p>
                            </div>
                          </div>
                          
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
                        
                        <div className="mt-4">
                          <p className={`text-gray-700 leading-relaxed ${!isExpanded && r.message.length > 150 ? 'line-clamp-3' : ''}`}>
                            {r.message}
                          </p>
                          
                          {r.message.length > 150 && (
                            <button
                              onClick={() => setExpandedReview(isExpanded ? null : r._id)}
                              className="text-[#c0954d] font-medium text-sm mt-2 flex items-center gap-1 hover:text-[#d4a75f] transition-colors"
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
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-8 border-t-2 border-gray-100">
                    <div className="text-sm text-gray-600 font-medium mb-4 sm:mb-0">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#c0954d] hover:text-[#c0954d]'}`}
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                              className={`w-11 h-11 rounded-lg font-semibold transition-all ${currentPage === pageNum ? 'bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#c0954d]'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2 text-gray-400">...</span>
                            <button
                              onClick={() => paginate(totalPages)}
                              className="w-11 h-11 rounded-lg font-semibold bg-white border-2 border-gray-300 text-gray-700 hover:border-[#c0954d] transition-all"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#c0954d] hover:text-[#c0954d]'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-xl shadow-2xl transform scale-100 transition-transform">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Edit Your Review</h3>
            <div className="flex gap-1 mb-6">
              {[...Array(editReview.rating)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" size={24} />
              ))}
            </div>
            <textarea
              className="border-2 border-gray-200 w-full p-4 rounded-xl focus:border-[#c0954d] focus:ring-2 focus:ring-[#c0954d]/20 transition-all outline-none resize-none"
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
                className="bg-gradient-to-r from-[#c0954d] to-[#d4a75f] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#d4a75f] hover:to-[#c0954d] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Drawer */}
      {pkg && (
        <BookingDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          service={pkg.name}
          type="package"
          price={pkg.price}
          duration={pkg.totalDuration}
        />
      )}
    </div>
  );
};

export default PackageDetail;