import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/admin/reviews";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  // 🔹 Fetch Reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        type ? `${API_URL}?type=${type}` : API_URL,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch reviews");

      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete Review
  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete review");

      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting review:", err.message);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [type]);

  if (loading) return <p style={{ padding: 20 }}>Loading reviews...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ marginBottom: 20 }}>⭐ Customer Reviews</h2>

      {/* Filter Dropdown */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{
          padding: "8px 12px",
          marginBottom: 20,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      >
        <option value="">All</option>
        <option value="Package">Package</option>
        <option value="Service">Service</option>
      </select>

      {reviews.length === 0 ? (
        <p>No reviews found</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ ...th, textAlign: "left" }}>Customer</th>
                <th style={{ ...th, textAlign: "left" }}>Email</th>
                <th style={{ ...th, textAlign: "center" }}>Rating</th>
                <th style={{ ...th, textAlign: "left" }}>Comment</th>
                <th style={{ ...th, textAlign: "center" }}>Type</th>
                <th style={{ ...th, textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td style={{ ...td, textAlign: "left" }}>
                    {review.CUSTOMER?.name || "-"}
                  </td>
                  <td style={{ ...td, textAlign: "left" }}>
                    {review.CUSTOMER?.email || "-"}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {review.rating} ⭐
                  </td>
                  <td style={{ ...td, textAlign: "left" }}>
                    {review.message || "-"}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {review.targetType || "-"}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <button
                      onClick={() => deleteReview(review._id)}
                      style={{
                        padding: "6px 12px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Table header styles
const th = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

// Table data cell styles
const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  verticalAlign: "middle",
};

export default AdminReviews;
