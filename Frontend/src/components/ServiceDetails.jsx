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
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/customer/services/${id}`
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
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/target/Service/${id}`
      );
      if (res.data?.success) setReviews(res.data.reviews);
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
    <div className="max-w-7xl mx-auto pt-28 px-4">
      {/* ===== SERVICE UI ===== */}
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2 h-[400px] rounded-2xl overflow-hidden">
          {service.images?.[0] ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${service.images[0]}`}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              💈
            </div>
          )}
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold">{service.name}</h1>

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

          

          <button
            onClick={() => setIsOpen(true)}
            className="mt-6 px-6 py-3 border border-[#D79A4A] hover:bg-[#BB8C4B] flex items-center gap-2"
          >
            Book Now <FaArrowRight />
          </button>
        </div>
      </div>

      {/* ===== REVIEWS ===== */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((r) => {
          const isOwner = r.CUSTOMER?._id === userId;
          return (
            <div key={r._id} className="border p-4 rounded-md mb-3">
              <div className="flex justify-between">
                <div>
                  <strong>{r.CUSTOMER?.name || "Anonymous"}</strong>
                  <div className="flex text-yellow-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>

                {isOwner && (
                  <div className="flex gap-3">
                    <FaEdit
                      className="cursor-pointer text-blue-600"
                      onClick={() => {
                        setEditReview(r);
                        setEditMessage(r.message);
                      }}
                    />
                    <FaTrash
                      className="cursor-pointer text-red-600"
                      onClick={() => deleteReview(r._id)}
                    />
                  </div>
                )}
              </div>

              <p className="mt-2">{r.message}</p>
            </div>
          );
        })}

        {/* ADD REVIEW */}
        {loggedIn && (
          <form
            onSubmit={handleSubmitReview}
            className="mt-6 p-6 border rounded-md"
          >
            <h3 className="font-semibold mb-2">Add Review</h3>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  className={`cursor-pointer ${
                    ratingInput >= s ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRatingInput(s)}
                />
              ))}
            </div>

            <textarea
              className="border w-full p-2 rounded"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />

            <button
              className="bg-[#BB8C4B] text-white px-4 py-2 mt-3 rounded"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-2">Edit Review</h3>
            <textarea
              className="border w-full p-2 rounded"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setEditReview(null)}>Cancel</button>
              <button
                onClick={submitEditReview}
                className="bg-[#BB8C4B] text-white px-4 py-2 rounded"
              >
                Save
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
    </div>
  );
};

export default ServiceDetails;
