import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

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

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    // ⚠️ FOR TESTING: Allow without token
    if (!token) {
      console.warn("⚠️ No token - running in test mode");
      return {
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();

      const params = {
        status: filters.status || undefined,
        date: filters.date || undefined,
        search: filters.search || undefined,
      };

      console.log("📤 Fetching appointments with:", { params });

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/admin/all`,
        {
          ...config,
          params,
        },
      );

      console.log("✅ Appointments response:", response.data);

      if (response.data.success) {
        setAppointments(response.data.appointments || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);

      if (error.response?.status === 401) {
        toast.error("Authentication required. Please login.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load appointments",
        );
      }

      // Set empty array to show "no appointments" instead of staying in loading
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const config = getAuthConfig();

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/admin/stats`,
        config,
      );

      if (response.data.success) {
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      // Don't show error toast for stats, just use empty stats
      setStats({});
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const config = getAuthConfig();

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/admin/${appointmentId}/status`,
        { status: newStatus },
        config,
      );

      if (response.data.success) {
        toast.success(`Appointment ${newStatus}`);
        fetchAppointments();
      }
    } catch (error) {
      console.error("❌ Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#BB8C4B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#BB8C4B] mb-8">
        All Appointments
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#BB8C4B]"
        />

        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#BB8C4B]"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#BB8C4B]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats Cards */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {["total", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <div
                key={status}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <p className="text-sm text-gray-600 capitalize">{status}</p>
                <p className="text-2xl font-bold text-[#BB8C4B]">
                  {stats[status] || 0}
                </p>
              </div>
            ),
          )}
        </div>
      )}

      {/* Appointments Table */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-lg">No appointments found</p>
          <p className="text-gray-400 text-sm mt-2">
            Appointments will appear here once customers book services
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#BB8C4B] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.customerEmail}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.customerPhone}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.service?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rs. {appointment.price}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(appointment.appointmentTime)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={appointment.status}
                        onChange={(e) =>
                          handleStatusUpdate(appointment._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                        }`}
                        disabled={
                          appointment.status === "cancelled" ||
                          appointment.status === "completed"
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          console.log("Appointment details:", appointment);
                          toast.success("Check console for details");
                        }}
                        className="text-[#BB8C4B] hover:text-[#A97C42] font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointmentsAdmin;
