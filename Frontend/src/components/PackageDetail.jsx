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
      <div className="space-y-1 mb-4">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviewStats.distribution[5 - star] || 0;
          const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm w-4">{star}</span>
                <FaStar className="text-yellow-400 ml-1" size={12} />
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden ml-2">
                <div 
                  className="h-full bg-yellow-400" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 ml-2 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!pkg) return <p className="text-center mt-20 text-gray-500">Package not found</p>;

  return (
    <div className="max-w-7xl mx-auto pt-28 px-4">
      {/* ===== PACKAGE UI ===== */}
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2 h-[400px] rounded-2xl overflow-hidden">
          <img
            src={`http://localhost:5000/${pkg.image}`}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold">{pkg.name}</h1>

          <div className="flex items-center gap-4">
            <p className="text-gray-600">Duration: {pkg.totalDuration}</p>
            <span className="text-3xl font-bold text-[#c0954d]">{pkg.price}/-</span>
          </div>

          <div ref={descRef} className="line-clamp-3 mt-2">
            <p>{pkg.description || "No description available"}</p>
          </div>

          <h3 className="text-xl font-semibold mt-6">Included Services</h3>
          <ul className="mb-6 border rounded-lg p-4">
            {pkg.services?.map((service) => (
              <li key={service._id} className="flex justify-between py-2 border-b last:border-b-0">
                <span className="font-medium">{service.name}</span>
                {service.price && (
                  <span className="text-[#c0954d]">{service.price}</span>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setIsOpen(true)}
            className="mt-6  max-h-12 max-w-60  px-6 py-3 bg-[#c0954d] text-white hover:bg-[#a87c3e] flex items-center gap-2 rounded-md"
          >
            Book This Package <FaArrowRight />
          </button>
        </div>
      </div>

      {/* ===== REVIEWS SECTION ===== */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Customer Reviews 
            {reviewStats.total > 0 && (
              <span className="ml-2 text-lg font-normal text-gray-600">
                ({reviewStats.total} reviews)
              </span>
            )}
          </h2>
          
          {/* ✅ درست حل: Write a Review بٹن ہمیشہ دکھائیں اگر صارف لاگ ان ہو اور فارم نہ دکھ رہا ہو */}
          {loggedIn && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="mt-2 md:mt-0 px-4 py-2 bg-[#c0954d] text-white rounded-md hover:bg-[#a87c3e]"
            >
              {reviews.length === 0 ? "Write First Review" : "Write a Review"}
            </button>
          )}
        </div>

        {/* ✅ درست حل: Review Form کو الگ سے ہمیشہ رینڈر کریں اگر showReviewForm true ہے */}
        {showReviewForm && loggedIn && (
          <div className="mb-8 p-6 border rounded-lg bg-white shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Write Your Review</h3>
              <button 
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar
                    key={s}
                    className={`cursor-pointer ${ratingInput >= s ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRatingInput(s)}
                    size={30}
                  />
                ))}
              </div>
              <textarea
                className="border w-full p-4 rounded text-lg"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Share your experience with this package..."
                rows={5}
              />
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#c0954d] text-white px-6 py-2 rounded-md hover:bg-[#a87c3e]"
                  disabled={submitting || !ratingInput || !messageInput.trim()}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ✅ درست حل: Reviews کو conditional rendering سے باہر نکالیں */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Rating Summary and Filters - ہمیشہ دکھائیں چاہے کوئی رِویو ہو یا نہ ہو */}
          <div className="lg:w-1/4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              {/* Average Rating */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-800">{reviewStats.average || 0}</div>
                <div className="flex justify-center my-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(reviewStats.average) ? "text-yellow-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}</p>
              </div>
              
              {/* Rating Distribution - صرف تبھی دکھائیں جب رِویوز ہوں */}
              {reviewStats.total > 0 && renderRatingBars()}
              
              {/* Filter by Rating - صرف تبھی دکھائیں جب رِویوز ہوں */}
              {reviewStats.total > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-sm font-medium mb-2">
                    <FaFilter className="mr-1" size={12} />
                    Filter by Rating
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterRating(0)}
                      className={`px-3 py-1 text-xs rounded-full ${filterRating === 0 ? 'bg-[#c0954d] text-white' : 'bg-gray-200'}`}
                    >
                      All
                    </button>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating)}
                        className={`px-3 py-1 text-xs rounded-full flex items-center ${filterRating === rating ? 'bg-[#c0954d] text-white' : 'bg-gray-200'}`}
                      >
                        {rating} <FaStar className="ml-1" size={10} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sort Options - صرف تبھی دکھائیں جبن رِویوز ہوں */}
              {reviewStats.total > 0 && (
                <div>
                  <div className="flex items-center text-sm font-medium mb-2">
                    <FaSort className="mr-1" size={12} />
                    Sort by
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="latest">Latest</option>
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
              <div className="text-center py-10 border rounded-lg">
                <p className="text-gray-500">No reviews yet. Be the first to review this package!</p>
                {loggedIn && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4 px-4 py-2 bg-[#c0954d] text-white rounded-md hover:bg-[#a87c3e]"
                  >
                    Write First Review
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Reviews Count and Filter Info */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {indexOfFirstReview + 1}-{Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} reviews
                  {filterRating > 0 && ` • Filtered by ${filterRating} star${filterRating > 1 ? 's' : ''}`}
                </div>
                
                {/* Reviews List - Compact Design */}
                <div className="space-y-4">
                  {currentReviews.map((r) => {
                    const isOwner = r.CUSTOMER?._id === userId;
                    const isExpanded = expandedReview === r._id;
                    
                    return (
                      <div
                        key={r._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-150 bg-white"
                      >
                        <div className="flex justify-between">
                          <div className="flex items-start">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold mr-3">
                              {r.CUSTOMER?.name?.charAt(0) || "A"}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <strong className="text-gray-800">
                                  {r.CUSTOMER?.name || "Anonymous"}
                                </strong>
                                <span className="mx-2 text-gray-400">•</span>
                                <div className="flex text-yellow-400">
                                  {[...Array(r.rating)].map((_, i) => (
                                    <FaStar key={i} size={14} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          
                          {isOwner && (
                            <div className="flex gap-3">
                              <FaEdit
                                className="cursor-pointer text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  setEditReview(r);
                                  setEditMessage(r.message);
                                }}
                                size={16}
                              />
                              <FaTrash
                                className="cursor-pointer text-red-600 hover:text-red-800"
                                onClick={() => deleteReview(r._id)}
                                size={16}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className={`text-gray-700 ${!isExpanded && 'line-clamp-2'}`}>
                            {r.message}
                          </p>
                          
                          {r.message.length > 150 && (
                            <button
                              onClick={() => setExpandedReview(isExpanded ? null : r._id)}
                              className="text-[#c0954d] text-sm mt-1 flex items-center"
                            >
                              {isExpanded ? (
                                <>
                                  Show less <FaChevronUp className="ml-1" size={12} />
                                </>
                              ) : (
                                <>
                                  Read more <FaChevronDown className="ml-1" size={12} />
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
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t">
                    <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
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
                              className={`w-10 h-10 rounded-md ${currentPage === pageNum ? 'bg-[#c0954d] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2">...</span>
                            <button
                              onClick={() => paginate(totalPages)}
                              className="w-10 h-10 rounded-md bg-gray-200 hover:bg-gray-300"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Edit Your Review</h3>
            <div className="flex gap-1 mb-4">
              {[...Array(editReview.rating)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
            </div>
            <textarea
              className="border w-full p-3 rounded"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setEditReview(null)}
                className="px-4 py-2 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitEditReview}
                className="bg-[#c0954d] text-white px-4 py-2 rounded"
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