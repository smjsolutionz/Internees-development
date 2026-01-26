import React, { useState, useEffect } from "react";
import { Calendar, Search, Filter, Eye, Check, X } from "lucide-react";

const AllAppointmentsAdmin = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    date: "",
    search: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [filters]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("accessToken");
    const queryParams = new URLSearchParams(filters).toString();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/admin/all?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/admin/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/admin/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        fetchAppointments();
        alert("Status updated successfully");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#BB8C4B",
      confirmed: "#22c55e",
      completed: "#3b82f6",
      cancelled: "#ef4444",
      "no-show": "#f59e0b",
    };
    return colors[status] || "#999999";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "#BB8C4B" }}>
          All Appointments
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600 capitalize">{key}</p>
              <p className="text-2xl font-bold" style={{ color: "#BB8C4B" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="border rounded px-4 py-2"
            />
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="border rounded px-4 py-2"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="border rounded px-4 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead style={{ backgroundColor: "#BB8C4B" }}>
              <tr>
                <th className="px-6 py-3 text-left text-white">Customer</th>
                <th className="px-6 py-3 text-left text-white">Service</th>
                <th className="px-6 py-3 text-left text-white">Date & Time</th>
                <th className="px-6 py-3 text-left text-white">Status</th>
                <th className="px-6 py-3 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id} className="border-b">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{apt.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {apt.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{apt.service?.name}</td>
                  <td className="px-6 py-4">
                    <p>{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">
                      {apt.appointmentTime}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${getStatusColor(apt.status)}20`,
                        color: getStatusColor(apt.status),
                      }}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {apt.status === "pending" && (
                        <button
                          onClick={() => updateStatus(apt._id, "confirmed")}
                          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          (window.location.href = `/appointment-details/${apt._id}`)
                        }
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllAppointmentsAdmin;
