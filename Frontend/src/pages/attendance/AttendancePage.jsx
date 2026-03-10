import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import axios from "axios";
import { FiSearch, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";
import AttendanceOverview from "../../components/attendance/AttendanceOverview";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ALL_ROLES = ["ALL", "MANAGER", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"];
const STATUSES = ["ALL", "Present", "Leave", "Absent", "Missed Checkout", "Late Checkout"];

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

export default function AttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ checkInTime: "", checkOutTime: "", status: "" });
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userRole = storedUser.role?.toUpperCase();
  const canEdit = userRole === "MANAGER";

  const ROLES =
    userRole === "ADMIN"
      ? ALL_ROLES
      : userRole === "MANAGER"
      ? ["ALL", "INVENTORY_MANAGER", "RECEPTIONIST", "STAFF"]
      : ["ALL", "STAFF"];

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const params = {};
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get(`${API_BASE_URL}/api/attendance/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (data.success) setAttendance(data.attendance || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else if (err.response?.status === 403) {
        navigate("/attendance/my");
      } else {
        toast.error(err.response?.data?.message || "Failed to fetch attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [roleFilter, statusFilter, startDate, endDate]);

  const handleSearch = () => {
    fetchAttendance();
  };

  const toDateTimeLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openEditModal = (record) => {
    setEditModal(record);
    setEditForm({
      checkInTime: toDateTimeLocal(record.checkInTime),
      checkOutTime: toDateTimeLocal(record.checkOutTime),
      status: record.status,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        checkInTime: editForm.checkInTime || null,
        checkOutTime: editForm.checkOutTime || null,
        status: editForm.status,
      };
      await axios.patch(
        `${API_BASE_URL}/api/attendance/${editModal._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Attendance updated successfully");
      setEditModal(null);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">Attendance</h1>

          {/* Overview (same style as dashboards) */}
          <AttendanceOverview />

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by name"
                    className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#BB8C4B]"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-4 py-2 bg-[#BB8C4B] text-white rounded hover:bg-[#a67c42]"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : attendance.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No attendance records found</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="p-4 space-y-3 md:hidden">
                  {attendance.map((r) => {
                    const canEditRow =
                      canEdit && ["RECEPTIONIST", "STAFF", "INVENTORY_MANAGER"].includes(r.employeeRole);
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
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{r.employeeName}</p>
                            <p className="text-xs text-gray-500">{r.employeeRole?.replace("_", " ")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${statusClass}`}>{r.status}</span>
                            {canEditRow && (
                              <button
                                onClick={() => openEditModal(r)}
                                className="text-[#BB8C4B] hover:text-[#a67c42]"
                                aria-label="Edit attendance"
                              >
                                <FiEdit2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-gray-900">{formatDate(r.date)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Check In</p>
                            <p className="text-gray-900">{formatTime(r.checkInTime)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Check Out</p>
                            <p className="text-gray-900">{formatTime(r.checkOutTime)}</p>
                          </div>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        {canEdit && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendance.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{r.employeeName}</td>
                          <td className="px-4 py-3 text-sm">{r.employeeRole?.replace("_", " ")}</td>
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
                            </span>
                          </td>
                          {canEdit && ["RECEPTIONIST", "STAFF", "INVENTORY_MANAGER"].includes(r.employeeRole) && (
                            <td className="px-4 py-3">
                              <button
                                onClick={() => openEditModal(r)}
                                className="text-[#BB8C4B] hover:text-[#a67c42]"
                              >
                                <FiEdit2 size={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Attendance</h3>
            <p className="text-sm text-gray-600 mb-4">
              {editModal.employeeName} - {formatDate(editModal.date)}
            </p>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <input
                  type="datetime-local"
                  value={editForm.checkInTime}
                  onChange={(e) => setEditForm((f) => ({ ...f, checkInTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <input
                  type="datetime-local"
                  value={editForm.checkOutTime}
                  onChange={(e) => setEditForm((f) => ({ ...f, checkOutTime: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  {STATUSES.filter((s) => s !== "ALL").map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#BB8C4B] text-white rounded hover:bg-[#a67c42]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
