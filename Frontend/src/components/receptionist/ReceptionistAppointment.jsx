import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ email: "", status: "", date: "" });
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const getAuthConfig = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAppointments = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/appointment/receptionist`, {
        ...getAuthConfig(),
        params: { page: pageToFetch, limit, status: filters.status || undefined, date: filters.date || undefined, search: filters.email || undefined },
      });

      const appts = data.appointments || [];
      setAppointments(appts);
      setPage(Number(data.currentPage) || pageToFetch);
      setTotalPages(Number(data.totalPages) || 1);

      setStats({
        total: data.total || appts.length,
        pending: appts.filter((a) => a.status === "pending").length,
        confirmed: appts.filter((a) => a.status === "confirmed").length,
        completed: appts.filter((a) => a.status === "completed").length,
        cancelled: appts.filter((a) => a.status === "cancelled").length,
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

  useEffect(() => { fetchAppointments(1); }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchAppointments(newPage);
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getItem = (appt) => appt.package || appt.service || {};

  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/api/appointment/receptionist/${id}/status`, { status: newStatus }, getAuthConfig());
      setAppointments((prev) => prev.map((appt) => (appt._id === id ? data.appointment : appt)));
    } catch (err) { alert("Failed to update status"); }
  };

  const cancelAppointment = async (id) => {
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/api/appointment/receptionist/${id}/cancel`, {}, getAuthConfig());
      setAppointments((prev) => prev.map((appt) => (appt._id === id ? data.appointment : appt)));
    } catch (err) { alert("Failed to cancel appointment"); }
  };

  if (loading) return (<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-14 w-14 border-b-2 border-[#BB8C4B] rounded-full" /></div>);
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white">
      <h1 className="text-3xl font-bold text-[#BB8C4B] mb-6">Receptionist Appointments</h1>

      {/* 🔹 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-2xl font-bold text-[#BB8C4B]">{val}</p>
          </div>
        ))}
      </div>

      {/* 🔹 Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="Search by email" value={filters.email} onChange={(e) => { setFilters({ ...filters, email: e.target.value }); setPage(1); }} className="border p-2 rounded w-full" />
        <input type="date" value={filters.date} onChange={(e) => { setFilters({ ...filters, date: e.target.value }); setPage(1); }} className="border p-2 rounded w-full" />
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="border p-2 rounded w-full">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* 🔹 Cards for all screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appt) => {
          const item = getItem(appt);
          const price = item.price || item.pricing || 0;
          const duration = item.duration || item.totalDuration || "N/A";

          return (
            <div key={appt._id} className="bg-white shadow rounded-xl p-4 border">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{appt.customerName}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appt.status)}`}>{appt.status}</span>
              </div>
              <div className="mt-2 text-sm space-y-1">
                <p>{appt.customerEmail} | {appt.customerPhone}</p>
                <p>Service: {item.name || "N/A"}</p>
                <p>Duration: {duration}</p>
                <p>Date: {new Date(appt.appointmentDate).toLocaleDateString()}</p>
                <p>Time: {formatTime(appt.appointmentTime)}</p>
                <p>Price: {price}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <select value={appt.status} onChange={(e) => updateStatus(appt._id, e.target.value)} className="flex-1 border px-2 py-1 rounded">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => cancelAppointment(appt._id)} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔹 Pagination */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400">Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-[#BB8C4B] text-white" : "bg-gray-200"}`}>{i + 1}</button>
        ))}
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400">Next</button>
      </div>
    </div>
  );
}
