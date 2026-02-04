import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingDrawer from "./BookingDrawer";
import { FaArrowRight, FaStar } from "react-icons/fa";

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const descRef = useRef(null);

const token = localStorage.getItem("accessToken");

  // Helper: check if token expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const loggedIn = token && !isTokenExpired(token);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/customer/services/${id}`
        );
        if (res.data.success) setService(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/target/service/${id}`
      );
      if (res.data.success) setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Check if description exceeds 3 lines
  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseInt(getComputedStyle(descRef.current).lineHeight, 10);
      const maxHeight = lineHeight * 3;
      if (descRef.current.scrollHeight > maxHeight) setShowReadMore(true);
    }
  }, [service]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (ratingInput === 0 || messageInput.trim() === "") {
      alert("Please provide a rating and message");
      return;
    }
    if (!loggedIn) {
      alert("Your session expired. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews`,
        {
          targetType: "Service",
          targetId: id,
          rating: Number(ratingInput),
          message: messageInput.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setMessageInput("");
        setRatingInput(0);
        fetchReviews(); // refresh reviews
      }
    } catch (err) {
      console.error("Submission error:", err.response || err.message);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500 animate-pulse">Loading...</p>;
  if (!service) return <p className="text-center mt-10 text-gray-500">Service not found</p>;

  return (
    <div className="max-w-7xl mx-auto pt-28 px-4">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Image */}
        <div className="md:w-1/2 h-[400px] overflow-hidden rounded-2xl">
          {service.images?.[0] ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${service.images[0].replace(/\\/g, "/")}`}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl text-[#BB8C4B] animate-bounce">💈</div>
          )}
        </div>

        {/* Details */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold">{service.name}</h1>
          {service.category && (
            <span className="bg-[#BB8C4B] text-white px-3 py-1 rounded-full text-sm">{service.category}</span>
          )}

          {/* Description */}
          <p
            ref={descRef}
            className={`transition-all duration-300 ${!showFullDescription ? "line-clamp-3 overflow-hidden" : ""}`}
          >
            {service.description}
          </p>
          {showReadMore && (
            <button
              className="text-[#BB8C4B] font-semibold hover:underline"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? "Read Less" : "Read More"}
            </button>
          )}

          {/* Duration & Price */}
          <div className="flex gap-6 mt-4">
            <span>Duration: {service.duration}</span>
            <span>Price: {Array.isArray(service.pricing) ? service.pricing[0] : service.pricing || "0"}</span>
          </div>

          {/* Book Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="mt-6 px-6 py-3 border border-[#D79A4A] hover:bg-[#BB8C4B] hover:text-white flex items-center gap-2"
          >
            Book Now <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="mb-4 p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <strong>{r.customer?.name || "Anonymous"}</strong>
              <span className="flex text-yellow-400">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </span>
            </div>
            <p>{r.message}</p>
          </div>
        ))}

        {/* Add Review Form */}
        {loggedIn ? (
          <div className="mt-6 p-6 border rounded-md bg-[#f9f9f9]">
            <h3 className="text-xl font-semibold mb-3">Add Your Review</h3>
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer ${ratingInput >= star ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRatingInput(star)}
                  />
                ))}
              </div>
              <textarea
                placeholder="Write your review..."
                className="border p-2 rounded-md w-full"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                rows={3}
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#BB8C4B] text-white py-2 px-4 rounded-md mt-2 hover:bg-[#a07737]"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-red-500 mt-4">Please log in to submit a review.</p>
        )}
      </div>

      {/* Booking Drawer */}
      {service && (
        <BookingDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          service={service.name}
          price={Array.isArray(service.pricing) ? service.pricing[0] : service.pricing || "0"}
        />
      )}
    </div>
  );
};

export default ServiceDetails;
