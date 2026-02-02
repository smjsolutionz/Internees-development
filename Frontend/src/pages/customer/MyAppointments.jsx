import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Scissors,
  X,
  AlertCircle,
  Filter,
  ArrowLeft,
} from "lucide-react";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      const url =
        filter === "all"
          ? "/appointments/my-appointments"
          : `/appointments/my-appointments?status=${filter}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}${url}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    setCancelling(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/${cancelModal}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cancellationReason: cancelReason }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      setCancelModal(null);
      setCancelReason("");
      fetchAppointments();
      alert("Appointment cancelled successfully");
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
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
    <div className="min-h-screen bg-[#060606] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 text-gray-400 hover:text-[#BB8C4B] mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-serif text-[#BB8C4B]">
              My Appointments
            </h1>
            <p className="text-gray-400 mt-2">Manage your bookings</p>
          </div>
          <button
            onClick={() => (window.location.href = "/book-appointment")}
            className="px-6 py-3 bg-[#BB8C4B] hover:bg-[#A97C42] text-black font-medium rounded-lg transition-colors"
          >
            + Book New Appointment
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  filter === status
                    ? "bg-[#BB8C4B] text-black"
                    : "bg-[#1f2024] text-gray-400 hover:text-white border-2 border-transparent hover:border-[#BB8C4B]"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[#BB8C4B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 bg-[#1f2024] rounded-lg">
            <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-700" />
            <p className="text-xl mb-2">No appointments found</p>
            <p className="text-gray-400 mb-6">
              {filter === "all"
                ? "You haven't booked any appointments yet"
                : `No ${filter} appointments`}
            </p>
            <button
              onClick={() => (window.location.href = "/book-appointment")}
              className="px-8 py-3 bg-[#BB8C4B] hover:bg-[#A97C42] text-black font-medium rounded-lg transition-colors"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-[#1f2024] rounded-lg p-6 border-l-4"
                style={{ borderColor: getStatusColor(appointment.status) }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <Scissors className="w-8 h-8 text-[#BB8C4B] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {appointment.service.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {appointment.service.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#BB8C4B]" />
                        <span className="text-gray-300">
                          {new Date(
                            appointment.appointmentDate,
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#BB8C4B]" />
                        <span className="text-gray-300">
                          {appointment.appointmentTime} ({appointment.duration}{" "}
                          min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#BB8C4B] font-semibold">
                          PKR {appointment.price}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-[#060606] rounded">
                        <p className="text-xs text-gray-500 mb-1">Notes:</p>
                        <p className="text-sm text-gray-300">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className="px-4 py-2 rounded-full text-xs font-bold uppercase"
                      style={{
                        backgroundColor: `${getStatusColor(appointment.status)}20`,
                        color: getStatusColor(appointment.status),
                      }}
                    >
                      {appointment.status}
                    </span>

                    {appointment.status === "pending" && (
                      <button
                        onClick={() => setCancelModal(appointment._id)}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-medium flex items-center gap-2 transition-colors border border-red-500/30"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/80">
            <div className="bg-[#1f2024] rounded-lg p-8 max-w-md w-full border border-[#BB8C4B]/30">
              <h3 className="text-2xl font-serif text-[#BB8C4B] mb-4">
                Cancel Appointment
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Please provide a reason for cancellation:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                placeholder="Reason for cancellation..."
                className="w-full bg-[#060606] border-2 border-gray-700 focus:border-[#BB8C4B] rounded-lg p-3 mb-4 text-white outline-none transition-colors resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancelModal(null);
                    setCancelReason("");
                  }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  disabled={cancelling}
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
