import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaStar, FaEdit, FaTrash } from "react-icons/fa";

const PackageDetail = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(0);
  const [messageInput, setMessageInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editReview, setEditReview] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  const token = localStorage.getItem("accessToken");

  // Extract user ID from token
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

  // Fetch package details
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/packages/${id}`);
        setPkg(res.data.data); // backend may return res.data.package depending on structure
      } catch (err) {
        console.error("❌ Package fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/customer/reviews/target/Package/${id}`
      );
      if (res.data.success) setReviews(res.data.reviews);
    } catch (err) {
      console.error("❌ Review fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Add review
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
      fetchReviews();
    } catch (err) {
      console.error("❌ Add review failed:", err.response || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit review
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

  // Delete review
  const deleteReview = async (reviewId) => {
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

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!pkg) return <p className="text-center mt-20 text-gray-500">Package not found</p>;

  return (
    <div className="max-w-7xl mx-auto pt-28 px-4">
      {/* Package Details */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <img
          src={`http://localhost:5000/${pkg.image}`}
          alt={pkg.name}
          className="w-full h-105 object-cover rounded-2xl shadow"
        />

        <div>
          <h1 className="text-4xl font-serif mb-2">{pkg.name}</h1>

          <p className="text-gray-600 mb-3">Duration: {pkg.totalDuration}</p>
          <p className="text-3xl font-bold text-[#c0954d] mb-6">{pkg.price}/-</p>

          <h3 className="text-xl font-semibold mb-4">Included Services</h3>
          <ul className="mb-6">
            {pkg.services.map((service) => (
              <li key={service._id} className="flex justify-between border-b pb-2 text-sm">
                <span>{service.name}</span>
              </li>
            ))}
          </ul>

          <button className="bg-[#c0954d] text-white py-3 px-8 rounded-md mt-6">
            Book This Package
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
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

        {/* Add Review Form */}
        {loggedIn && (
          <form onSubmit={handleSubmitReview} className="mt-6 p-6 border rounded-md">
            <h3 className="font-semibold mb-2">Add Review</h3>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  className={`cursor-pointer ${ratingInput >= s ? "text-yellow-400" : "text-gray-300"}`}
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

      {/* Edit Modal */}
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
    </div>
  );
};

export default PackageDetail;
