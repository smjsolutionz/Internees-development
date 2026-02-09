import React, { useState, useEffect } from "react";
import axios from "axios";

const AllAppointmentsAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    date: "",
    search: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch appointments from backend
  const fetchAppointments = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Login required");

      const res = await axios.get(
        "http://localhost:5000/api/appointment/admin/appointments",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status: filters.status || undefined,
            date: filters.date || undefined,
            search: filters.search || undefined,
            page: pageToFetch,
            limit,
          },
        }
      );

      const data = res.data.appointments || [];
      const totalItems = res.data.total || data.length;

      // Backend currentPage and totalPages are now numbers
      const currentPage = Number(res.data.currentPage) || pageToFetch;
      const totalPagesFromBackend = Number(res.data.totalPages) || Math.ceil(totalItems / limit);

      setAppointments(data);
      setPage(currentPage);
      setTotalPages(totalPagesFromBackend);

      // Update stats from current page data
      setStats({
        total: totalItems,
        pending: data.filter(a => a.status === "pending").length,
        confirmed: data.filter(a => a.status === "confirmed").length,
        completed: data.filter(a => a.status === "completed").length,
        cancelled: data.filter(a => a.status === "cancelled").length,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
      setAppointments([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch page 1 whenever filters change
  useEffect(() => {
    fetchAppointments(1);
  }, [filters]);

  // Handle pagination clicks
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage); // immediately update page
    fetchAppointments(newPage);
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-14 w-14 border-b-2 border-[#BB8C4B] rounded-full" />
      </div>
    );
  }

  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl bg-white   mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#BB8C4B] mb-6">All Appointments</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow grid md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search name or email"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-2xl font-bold text-[#BB8C4B]">{val}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {appointments.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-10 rounded shadow">
          No appointments found
        </div>
      ) : (
        <>
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-[#BB8C4B] text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Service</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {appt.CUSTOMER?.name || appt.customerName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">{appt.customerEmail || "N/A"}</p>
                      <p className="text-sm text-gray-500">{appt.customerPhone || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{appt.service?.pricing || 0}</td>
                    <td className="px-6 py-4">{appt.service?.name || "N/A"}</td>
                    <td className="px-6 py-4">
                      <p>{formatDate(appt.appointmentDate)}</p>
                      <p>{formatTime(appt.appointmentTime)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          appt.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : appt.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appt.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? "bg-[#BB8C4B] text-white" : "bg-gray-200"}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllAppointmentsAdmin;
