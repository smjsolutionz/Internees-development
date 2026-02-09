import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaCalendarAlt, FaClock, FaTag, FaDollarSign } from "react-icons/fa";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | pending | confirmed | completed | cancelled
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [reschedulingId, setReschedulingId] = useState(null);

  const limit = 10; // appointments per page

  const fetchAppointments = async (pageToFetch = page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login first");
        setAppointments([]);
        setLoading(false);
        return;
      }

      const params = { page: pageToFetch, limit };
      if (filter !== "all") params.status = filter;

      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/my-appointments`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      if (data?.success) {
        setAppointments(data.appointments || []);
        setPage(Number(data.currentPage) || pageToFetch);
        setTotalPages(Number(data.totalPages) || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAppointments(1);
  }, [filter]);

  useEffect(() => {
    fetchAppointments(page);
  }, [page]);

  // Cancel appointment
  const handleCancel = async (id, date) => {
    const apptDate = new Date(date);
    if (apptDate < new Date()) return toast.error("Cannot cancel past appointments");
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/${id}/cancel`,
        { cancellationReason: "Cancelled by customer" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        toast.success("Appointment cancelled");
        fetchAppointments(page);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel appointment");
    }
  };

  // Reschedule appointment
  const handleReschedule = async (id) => {
    if (!rescheduleDate || !rescheduleTime) return toast.error("Please select date and time");

    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/${id}/reschedule`,
        { appointmentDate: rescheduleDate, appointmentTime: rescheduleTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        toast.success("Appointment rescheduled");
        setReschedulingId(null);
        setRescheduleDate("");
        setRescheduleTime("");
        fetchAppointments(page);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reschedule appointment");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-200"}`}>{status}</span>;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  if (loading) return <div className="text-center py-20">Loading appointments...</div>;

  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1} className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400">Prev</button>
      {[...Array(totalPages)].map((_, i) => (
        <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-[#BB8C4B] text-white" : "bg-gray-200"}`}>{i + 1}</button>
      ))}
      <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages} className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400">Next</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-[120px]">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-2 text-gray-600">View and manage your upcoming and past appointments</p>
      </div>

      {/* Filters */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 font-medium capitalize transition-all ${filter === f ? "border-b-2 border-[#BB8C4B] text-[#BB8C4B]" : "text-gray-600 hover:text-gray-900"}`}>{f}</button>
          ))}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">{filter === "all" ? "You haven't booked any appointments yet" : `No ${filter} appointments`}</p>
          <a href="/services" className="mt-6 inline-block bg-[#BB8C4B] text-white px-6 py-3 rounded hover:bg-[#A97C42] transition">Browse Services</a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((a) => (
              <div key={a._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] p-4 text-white flex justify-between flex-col">
                  <h3 className="font-bold text-lg">  {  a.package?.name || a.service?.name ||  a.serviceName || a.packageName}</h3>
                  <p className="text-sm text-gray-200 mt-1">{a.CUSTOMER?.email || a.customerEmail} <br /> {a.CUSTOMER?.phone || a.customerPhone}</p>
                  <div className="mt-2">{getStatusBadge(a.status)}</div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-gray-700"><FaCalendarAlt className="text-[#BB8C4B]" /><span>{formatDate(a.appointmentDate)}</span></div>
                  <div className="flex items-center gap-3 text-gray-700"><FaClock className="text-[#BB8C4B]" /><span>{formatTime(a.appointmentTime)}</span></div>
                  <div className="flex items-center gap-3 text-gray-700"><FaTag className="text-[#BB8C4B]" /><span>{a.duration ||  a.package?.totalDuration || a.service?.duration || 0}</span></div>
                  <div className="flex items-center gap-3 text-gray-700"><FaDollarSign className="text-[#BB8C4B]" /><span>{a.price || a.service?.pricing || a.package?.price || 0}</span></div>
                  {a.notes && <p className="text-sm text-gray-600 pt-2 border-t"><b>Notes:</b> {a.notes}</p>}
                </div>

                {/* Footer */}
                {a.status !== "cancelled" && a.status !== "completed" && (
                  <div className="px-4 pb-4 space-y-2">
                    <button onClick={() => handleCancel(a._id, a.appointmentDate)} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm font-medium">Cancel</button>
                    {reschedulingId !== a._id ? (
                      <button onClick={() => setReschedulingId(a._id)} className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition text-sm font-medium">Reschedule</button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className="border px-2 py-1 rounded"/>
                        <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className="border px-2 py-1 rounded"/>
                        <div className="flex gap-2">
                          <button onClick={() => handleReschedule(a._id)} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm font-medium">Confirm</button>
                          <button onClick={() => setReschedulingId(null)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition text-sm font-medium">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination - bottom only */}
          <Pagination />
        </>
      )}
    </div>
  );
};

export default MyAppointments;
