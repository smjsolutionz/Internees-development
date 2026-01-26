import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Scissors,
  X,
  AlertCircle,
  CheckCircle,
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

  const getStatusBadge = (status) => {
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-bold uppercase"
        style={{
          backgroundColor: `${getStatusColor(status)}20`,
          color: getStatusColor(status),
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #222227 0%, #303133 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              My Appointments
            </h1>
            <p className="text-sm" style={{ color: "#999999" }}>
              Manage your bookings
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/book-appointment")}
            className="px-6 py-3 rounded-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
              color: "#222227",
            }}
          >
            + New Appointment
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: filter === status ? "#BB8C4B" : "#303133",
                  color: filter === status ? "#222227" : "#FFFFFF",
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ),
          )}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: "#BB8C4B", borderTopColor: "transparent" }}
            ></div>
            <p className="mt-4" style={{ color: "#999999" }}>
              Loading appointments...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div
            className="text-center py-12 rounded-lg"
            style={{ backgroundColor: "#303133" }}
          >
            <Calendar
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "#777777" }}
            />
            <p className="text-lg mb-2" style={{ color: "#FFFFFF" }}>
              No appointments found
            </p>
            <p className="text-sm mb-4" style={{ color: "#999999" }}>
              {filter === "all"
                ? "You haven't booked any appointments yet"
                : `No ${filter} appointments`}
            </p>
            <button
              onClick={() => (window.location.href = "/book-appointment")}
              className="px-6 py-2 rounded-lg font-bold"
              style={{
                background: "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
                color: "#222227",
              }}
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: "#303133",
                  borderLeft: `4px solid ${getStatusColor(appointment.status)}`,
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <Scissors
                      className="w-6 h-6 mt-1"
                      style={{ color: "#BB8C4B" }}
                    />
                    <div>
                      <h3
                        className="font-semibold text-lg"
                        style={{ color: "#FFFFFF" }}
                      >
                        {appointment.service.name}
                      </h3>
                      <p className="text-sm" style={{ color: "#999999" }}>
                        {appointment.service.description}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{ color: "#BB8C4B" }}
                    />
                    <span className="text-sm" style={{ color: "#DDDDDD" }}>
                      {new Date(appointment.appointmentDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: "#BB8C4B" }} />
                    <span className="text-sm" style={{ color: "#DDDDDD" }}>
                      {appointment.appointmentTime} ({appointment.duration} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#BB8C4B" }}
                    >
                      PKR {appointment.price}
                    </span>
                  </div>
                </div>

                {appointment.notes && (
                  <div
                    className="p-3 rounded mb-4"
                    style={{ backgroundColor: "#222227" }}
                  >
                    <p className="text-xs mb-1" style={{ color: "#999999" }}>
                      Notes:
                    </p>
                    <p className="text-sm" style={{ color: "#DDDDDD" }}>
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {appointment.status === "pending" && (
                  <button
                    onClick={() => setCancelModal(appointment._id)}
                    className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
                    style={{ backgroundColor: "#ef4444", color: "#FFFFFF" }}
                  >
                    <X className="w-4 h-4" />
                    Cancel Appointment
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModal && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{ backgroundColor: "#303133" }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: "#FFFFFF" }}
              >
                Cancel Appointment
              </h3>
              <p className="text-sm mb-4" style={{ color: "#999999" }}>
                Please provide a reason for cancellation:
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                placeholder="Reason for cancellation..."
                className="w-full rounded-lg p-3 mb-4 focus:outline-none"
                style={{
                  backgroundColor: "#222227",
                  borderWidth: "1px",
                  borderColor: "#777777",
                  color: "#FFFFFF",
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancelModal(null);
                    setCancelReason("");
                  }}
                  className="flex-1 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: "#777777", color: "#FFFFFF" }}
                  disabled={cancelling}
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelAppointment}
                  disabled={cancelling}
                  className="flex-1 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#FFFFFF",
                    cursor: cancelling ? "not-allowed" : "pointer",
                    opacity: cancelling ? 0.6 : 1,
                  }}
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
