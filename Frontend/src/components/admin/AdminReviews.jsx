import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/admin/reviews";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Fetch Reviews
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

  // Delete Review
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

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
    fetchReviews();
  }, [type]);

  if (loading) return <p className="p-5">Loading reviews...</p>;

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-semibold mb-5">⭐ Customer Reviews</h2>

      {/* Filter Dropdown */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="px-3 py-2 mb-5 border border-gray-300 rounded-md"
      >
        <option value="">All</option>
        <option value="Package">Package</option>
        <option value="Service">Service</option>
      </select>

      {reviews.length === 0 ? (
        <p>No reviews found</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full min-w-[600px] border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left border-b border-gray-200">Customer</th>
                  <th className="p-3 text-left border-b border-gray-200">Email</th>
                  <th className="p-3 text-center border-b border-gray-200">Rating</th>
                  <th className="p-3 text-left border-b border-gray-200">Comment</th>
                  <th className="p-3 text-center border-b border-gray-200">Type</th>
                  <th className="p-3 text-center border-b border-gray-200">Date</th>
                  <th className="p-3 text-center border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentReviews.map((review) => (
                  <tr key={review._id}>
                    <td className="p-3 text-left border-b border-gray-100">{review.CUSTOMER?.name || "-"}</td>
                    <td className="p-3 text-left border-b border-gray-100">{review.CUSTOMER?.email || "-"}</td>
                    <td className="p-3 text-center border-b border-gray-100">{review.rating} ⭐</td>
                    <td className="p-3 text-left border-b border-gray-100">{review.message || "-"}</td>
                    <td className="p-3 text-center border-b border-gray-100">{review.targetType || "-"}</td>
                    <td className="p-3 text-center border-b border-gray-100">{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-center border-b border-gray-100">
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {currentReviews.map((review) => (
              <div key={review._id} className="p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-2">
                <p><strong>Customer:</strong> {review.CUSTOMER?.name || "-"}</p>
                <p><strong>Email:</strong> {review.CUSTOMER?.email || "-"}</p>
                <p><strong>Rating:</strong> {review.rating} ⭐</p>
                <p><strong>Comment:</strong> {review.message || "-"}</p>
                <p><strong>Type:</strong> {review.targetType || "-"}</p>
                <p><strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
                <button
                  onClick={() => deleteReview(review._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-5 flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 rounded border border-gray-300 bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 rounded border border-gray-300 bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReviews;