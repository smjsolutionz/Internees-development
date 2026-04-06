import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatTime(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyAttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/attendance/my`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });

      if (data.success) {
        setAttendance(data.attendance || []);
        setCurrentPage(1);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to fetch attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate]);

  // Pagination logic
  const totalPages = Math.ceil(attendance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAttendance = attendance.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">My Attendance</h1>

          {/* Date Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : attendance.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No attendance records found</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="p-4 space-y-3 md:hidden">
                  {paginatedAttendance.map((r) => {
                    const statusClass =
                      r.status === "Present"
                        ? "bg-green-100 text-green-800"
                        : r.status === "Leave"
                        ? "bg-blue-100 text-blue-800"
                        : r.status === "Absent"
                        ? "bg-red-100 text-red-800"
                        : r.status === "Missed Checkout"
                        ? "bg-amber-100 text-amber-800"
                        : r.status === "Late Checkout"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800";

                    return (
                      <div key={r._id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{formatDate(r.date)}</p>
                            <p className="text-xs text-gray-500">
                              In: {formatTime(r.checkInTime)} · Out: {formatTime(r.checkOutTime)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${statusClass}`}>
                            {r.status}
                            {r.leaveType ? ` (${r.leaveType})` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedAttendance.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{formatDate(r.date)}</td>
                          <td className="px-4 py-3 text-sm">{formatTime(r.checkInTime)}</td>
                          <td className="px-4 py-3 text-sm">{formatTime(r.checkOutTime)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                r.status === "Present"
                                  ? "bg-green-100 text-green-800"
                                  : r.status === "Leave"
                                  ? "bg-blue-100 text-blue-800"
                                  : r.status === "Absent"
                                  ? "bg-red-100 text-red-800"
                                  : r.status === "Missed Checkout"
                                  ? "bg-amber-100 text-amber-800"
                                  : r.status === "Late Checkout"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {r.status}
                              {r.leaveType ? ` (${r.leaveType})` : ""}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-4 border-t bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}