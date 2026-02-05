import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingDrawer from "./BookingDrawer";
import { FaArrowRight, FaStar, FaTrash, FaEdit } from "react-icons/fa";

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        const response = await axios.get(
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

useEffect(() => {
  if (descRef.current) {
    const lineHeight = parseInt(
      getComputedStyle(descRef.current).lineHeight,
      10
    );
    const maxHeight = lineHeight * 3;
    if (descRef.current.scrollHeight > maxHeight) {
      setShowReadMore(true);
    }
  }
}, []);


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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRatingInput(0);
      setMessageInput("");
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
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
    } catch (err) {
      console.error("❌ Delete review failed:", err.response || err.message);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!service) return <p>Service not found</p>;

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl container mx-auto pt-[100px] mt-10 mb-10 py-12 px-4 sm:px-6 md:px-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-12">
        {/* IMAGE SECTION */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden rounded-2xl">
            {service.images && service.images.length > 0 ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}/${service.images[0].replace(/\\/g, "/")}`}
                alt={service.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="text-8xl text-[#BB8C4B] animate-bounce w-full h-full flex items-center justify-center">
                💈
              </div>
            )}
          </div>
        </div>

        {/* TEXT SECTION */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
            {service.name}
          </h1>

          {service.category && (
            <span className="bg-[#BB8C4B] text-white px-3 py-1 rounded-full w-fit text-sm">
              {service.category}
            </span>
          )}
          <p ref={descRef} className="line-clamp-3 mt-2">
            {service.description}
          </p>

          {/* Duration & Price */}
          <div className="flex gap-4 mt-2 text-gray-700">
            {service.duration && (
              <span>
                <strong>Duration:</strong> {service.duration} 
              </span>
            )}
            {service.pricing && (
              <span>
                <strong>Price:</strong> {service.pricing}
              </span>
            )}
          </div>

          {/* DURATION & PRICE */}
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 mt-4 sm:mt-6 justify-center md:justify-start w-full">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">Duration:</span>
              <span className="text-gray-600">{service.duration} min</span>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="font-semibold text-gray-800">Price:</span>
              <span className="text-gray-600">
                Rs.{" "}
                {Array.isArray(service.pricing)
                  ? service.pricing[0]
                  : service.pricing || "0"}
              </span>
            </div>
          </div>

          {/* BOOK NOW BUTTON */}
          <button
            onClick={() => setIsOpen(true)}
            className="mt-6 px-6 py-3 border border-[#D79A4A] hover:bg-[#BB8C4B] flex items-center gap-2"
          >
            Book Now{" "}
            <FaArrowRight className="inline-block text-sm sm:text-base" />
            <span className="absolute -top-2 -left-2 w-6 h-2 border-t border-l border-[#D79A4A] group-hover:w-8 transition-all duration-300" />
            <span className="absolute -top-2 -right-2 w-6 h-2 border-t border-r border-[#D79A4A] group-hover:w-8 transition-all duration-300" />
            <span className="absolute -bottom-2 -left-2 w-6 h-2 border-b border-l border-[#D79A4A] group-hover:w-8 transition-all duration-300" />
            <span className="absolute -bottom-2 -right-2 w-6 h-2 border-b border-r border-[#D79A4A] group-hover:w-8 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Booking Drawer */}
      {service && (
        <BookingDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          service={service.name}
          serviceId={id} // ✅ Pass service ID
          price={
            Array.isArray(service.pricing)
              ? service.pricing[0]
              : service.pricing || "0"
          }
        />
      )}

      <BookingDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        service={service.name}
      />
    </div>
  );
};

export default ServiceDetails;
