import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Staffshift() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Format time to AM/PM
  const formatTime = (time) => {
    if (!time) return "N/A";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  // 🔹 Fetch shift
  const fetchShift = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `http://localhost:5000/api/staff/appointments/my-shift${
          selectedDate ? `?date=${selectedDate}` : ""
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getItem = (appt) => appt.package || appt.service || {};
  const getDuration = (appt) => {
    const item = getItem(appt);
    return item.totalDuration || item.duration || "N/A";
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl text-[#BB8C4B] font-bold text-center sm:text-left">
            My Shift
          </h1>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full sm:w-auto"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={fetchShift}
              className="bg-[#BB8C4B] text-white px-4 py-2 rounded-lg hover:bg-black transition w-full sm:w-auto"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <p className="text-center">Loading shift...</p>}

        {/* Empty State */}
        {!loading && appointments.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center mt-6">
            No appointments found for selected date.
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {appointments.map((appt) => {
            const item = getItem(appt);
            const duration = getDuration(appt);
            return (
              <div
                key={appt._id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition duration-300 border border-gray-100"
              >
                {/* Time + Status */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {formatTime(appt.appointmentTime)}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs sm:text-sm rounded-full ${getStatusColor(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </div>

                {/* Service Name */}
                <p className="font-medium text-[#BB8C4B] mb-1 text-sm sm:text-base">
                  {item.name || "Service/Package"}
                </p>

                {/* Duration */}
                <p className="text-xs text-gray-500 mb-3">Duration: {duration} </p>

                {/* Customer Info */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {appt.customerName}</p>
                  
                </div>

                {/* Date */}
                <p className="mt-4 text-xs text-gray-400">
                  {appt.appointmentDate
                    ? new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}