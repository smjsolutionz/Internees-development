import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const [filters, setFilters] = useState({ email: "", status: "", date: "" });
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [staffList, setStaffList] = useState([]);

  /* ================= BILL STATES ================= */
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);
  const [paidAmount, setPaidAmount] = useState("");

  /* ================= RESCHEDULE STATES ================= */
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ id: null, date: "", time: "", availableSlots: [] });

  const limit = 10;

  const getAuthConfig = () => {
    const token = localStorage.getItem("accessToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  /* ================= FETCH APPOINTMENTS ================= */
  const fetchAppointments = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/appointment/receptionist`, {
        ...getAuthConfig(),
        params: {
          page: pageToFetch,
          limit,
          status: filters.status || undefined,
          date: filters.date || undefined,
          search: filters.email || undefined,
        },
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

  /* ================= FETCH STAFF ================= */
  const fetchStaffList = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/appointment/receptionist/staff`, getAuthConfig());
      setStaffList(data.staff || []);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  useEffect(() => {
    fetchStaffList();
    fetchAppointments(1);
  }, []);

  useEffect(() => {
    fetchAppointments(1);
  }, [filters]);

  /* ================= PAGINATION ================= */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchAppointments(newPage);
  };

  /* ================= HELPERS ================= */
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

  /* ================= ACTIONS ================= */
  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/appointment/receptionist/${id}/status`,
        { status: newStatus },
        getAuthConfig()
      );
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === id ? { ...appt, status: data.appointment.status } : appt
        )
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/appointment/receptionist/${id}/cancel`,
        {},
        getAuthConfig()
      );
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === id ? { ...appt, status: data.appointment.status } : appt
        )
      );
    } catch (err) {
      alert("Failed to cancel appointment");
    }
  };

  const assignStaff = async (appointmentId, staffId) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/appointment/receptionist/${appointmentId}/assign-staff`,
        { staffId },
        getAuthConfig()
      );
      const assignedStaff = data.appointment.staff || staffList.find(s => s._id === staffId);
      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointmentId
            ? { ...appt, staff: assignedStaff }
            : appt
        )
      );
      setMessage({ type: "success", text: data.message });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to assign staff";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  /* ================= RESCHEDULE ================= */
  const openRescheduleModal = async (appt) => {
    const apptDate = new Date(appt.appointmentDate).toISOString().slice(0, 10);
    setRescheduleData({ id: appt._id, date: apptDate, time: appt.appointmentTime, availableSlots: [] });

    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/appointment/receptionist/${appt._id}/available-slots`,
        { ...getAuthConfig(), params: { date: apptDate } }
      );

      setRescheduleData(prev => ({ ...prev, availableSlots: data.availableSlots || [] }));
      setShowRescheduleModal(true);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to fetch available slots" });
    }
  };

  const rescheduleAppointment = async () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      setMessage({ type: "error", text: "Please select date and time" });
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL}/api/appointment/receptionist/${rescheduleData.id}/reschedule`,
        { appointmentDate: rescheduleData.date, appointmentTime: rescheduleData.time },
        getAuthConfig()
      );
      setMessage({ type: "success", text: "Appointment rescheduled successfully" });
      setShowRescheduleModal(false);
      fetchAppointments(page);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to reschedule";
      setMessage({ type: "error", text: errMsg });
    }
  };

  /* ================= BILL ================= */
 const generateBill = async (appointment, force = false) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/bill/generate`,
      { appointmentId: appointment._id, force },
      getAuthConfig()
    );
    setBillData(data.bill);
    setShowBillModal(true);
    setMessage({ type: "success", text: "Bill generated successfully" });

    // Update appointment locally so button text updates
    setAppointments(prev =>
      prev.map(appt =>
        appt._id === appointment._id ? { ...appt, bill: data.bill } : appt
      )
    );

  } catch (err) {
    const errMsg = err.response?.data?.message || "Bill generation failed";
    setMessage({ type: "error", text: errMsg });
  }
};

  const confirmPayment = async () => {
    if (!paidAmount) {
      setMessage({ type: "error", text: "Enter paid amount" });
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/bill/confirm-payment/${billData._id}`,
        { paidAmount },
        getAuthConfig()
      );
      setBillData(data.bill);
      setMessage({ type: "success", text: "Payment successful" });
    } catch (err) {
      setMessage({ type: "error", text: "Payment failed" });
    }
  };

  const printReceipt = () => {
    const receiptWindow = window.open("", "_blank");
    receiptWindow.document.write(`
      <h2>Diamond Trim Beauty Studio</h2>
      <p>Bill Number: ${billData.billNumber}</p>
      <p>Customer: ${billData.customerName}</p>
      <p>Service: ${billData.serviceName}</p>
      <p>Total Amount: ${billData.totalAmount}</p>
      <p>Paid Amount: ${billData.paidAmount}</p>
      <p>Date: ${new Date().toLocaleString()}</p>
      <h3>Thank you for visiting!</h3>
    `);
    receiptWindow.print();
  };

  /* ================= AUTO-HIDE MESSAGE ================= */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  /* ================= LOADING/ERROR ================= */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-14 w-14 border-b-2 border-[#BB8C4B] rounded-full" />
      </div>
    );

  if (error) return <div className="text-center text-red-600">{error}</div>;

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-[#BB8C4B] mb-6">Receptionist Appointments</h1>

      {message && (
        <div className={`mb-4 p-2 rounded text-center ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-2xl font-bold text-[#BB8C4B]">{val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="Search by email" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })} className="border p-2 rounded w-full" />
        <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} className="border p-2 rounded w-full" />
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded w-full">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map(appt => {
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
                {appt.staff && <p>Assigned Staff: {appt.staff.name} {appt.staff.specialty ? `(${appt.staff.specialty})` : ""}</p>}
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <select value={appt.status} onChange={e => updateStatus(appt._id, e.target.value)} className="flex-1 border px-2 py-1 rounded">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => cancelAppointment(appt._id)} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
                </div>

                <select value={appt.staff?._id || ""} onChange={e => assignStaff(appt._id, e.target.value)} className="border px-2 py-1 rounded">
                  <option value="">Assign Staff</option>
                  {staffList.map(staff => <option key={staff._id} value={staff._id}>{staff.name} {staff.specialty ? `(${staff.specialty})` : ""}</option>)}
                </select>

              <div className="flex gap-2">
  <button onClick={() => openRescheduleModal(appt)} className="bg-[#BB8C4B] text-white px-3 py-1 rounded flex-1">
    Reschedule
  </button>
 <button
  onClick={() => generateBill(appt, true)} // pass `true` to force regeneration
  className="bg-[#BB8C4B] text-white px-3 py-1 rounded flex-1 flex items-center justify-center gap-1"
>
  <FileText size={16} />
  {appt.bill && appt.bill.paidAmount === 0 ? "Regenerate Bill" : "Generate Bill"}
</button>
</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400">Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-[#BB8C4B] text-white" : "bg-gray-200"}`}>{i + 1}</button>
        ))}
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-4 py-2 rounded bg-gray-200 disabled:bg-gray-400">Next</button>
      </div>

      {/* ================= RESCHEDULE MODAL ================= */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Reschedule Appointment</h2>

            <label className="block mb-2">Select Date:</label>
            <input type="date" value={rescheduleData.date} onChange={async e => {
              const newDate = e.target.value;
              setRescheduleData(prev => ({ ...prev, date: newDate }));
              try {
                const { data } = await axios.get(`${API_BASE_URL}/api/appointment/receptionist/${rescheduleData.id}/available-slots`, {
                  ...getAuthConfig(),
                  params: { date: newDate }
                });
                setRescheduleData(prev => ({ ...prev, availableSlots: data.availableSlots || [] }));
              } catch (err) {
                console.error(err);
                setMessage({ type: "error", text: "Failed to fetch available slots" });
              }
            }} className="border px-2 py-1 rounded w-full mb-4" />

            <label className="block mb-2">Select Time Slot:</label>
            <select value={rescheduleData.time} onChange={e => setRescheduleData(prev => ({ ...prev, time: e.target.value }))} className="border px-2 py-1 rounded w-full mb-4">
              <option value="">Select Slot</option>
              {rescheduleData.availableSlots.map(slot => <option key={slot} value={slot}>{formatTime(slot)}</option>)}
            </select>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-gray-300" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-[#BB8C4B] text-white" onClick={rescheduleAppointment}>Reschedule</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BILL MODAL ================= */}
      {showBillModal && billData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Bill Details</h2>
            {message && (
  <div className={`mb-3 p-2 rounded text-center ${
    message.type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }`}>
    {message.text}
  </div>
)}

            <p>Bill Number: {billData.billNumber}</p>
            <p>Customer: {billData.customerName}</p>
            <p>Service: {billData.serviceName}</p>
            <p>Total Amount: {billData.totalAmount}</p>
            <p>Paid Amount: {billData.paidAmount || 0}</p>

            <label className="block mb-2 mt-3">Enter Paid Amount:</label>
            <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="border px-2 py-1 rounded w-full mb-4" />

            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 rounded bg-gray-300" onClick={() => setShowBillModal(false)}>Close</button>
              <button className="px-3 py-1 rounded bg-green-500 text-white" onClick={confirmPayment}>Confirm Payment</button>
              <button className="px-3 py-1 rounded bg-blue-500 text-white" onClick={printReceipt}>Print</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}