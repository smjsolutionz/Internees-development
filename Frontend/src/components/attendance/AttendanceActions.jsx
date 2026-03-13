import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AttendanceActions({ onUpdate }) {
  const [status, setStatus] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [canMarkLeave, setCanMarkLeave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [leaveDate, setLeaveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const { data } = await axios.get(`${API_BASE_URL}/api/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setStatus(data.status);
        setCanCheckIn(data.canCheckIn ?? true);
        setCanCheckOut(data.canCheckOut ?? false);
        setCanMarkLeave(data.canMarkLeave ?? true);
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/api/attendance/check-in`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Check-in successful");
      fetchTodayStatus();
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/api/attendance/check-out`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Check-out successful");
      fetchTodayStatus();
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLeave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/api/attendance/leave`,
        { leaveType, date: leaveDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Leave marked successfully");
      setLeaveModal(false);
      fetchTodayStatus();
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Today&apos;s Attendance</p>
      <div className="flex flex-wrap gap-2">
        {canCheckIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Check In
          </button>
        )}
        {canCheckOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Check Out
          </button>
        )}
        {canMarkLeave && (
          <button
            onClick={() => setLeaveModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Mark Leave
          </button>
        )}
        {status && !canCheckIn && !canCheckOut && !canMarkLeave && (
          <span className="px-4 py-2 bg-gray-200 rounded text-gray-700">Status: {status}</span>
        )}
      </div>

      {/* Leave Modal */}
      {leaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Mark Leave</h3>
            <form onSubmit={handleMarkLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setLeaveModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Mark Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
