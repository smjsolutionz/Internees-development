import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import StatCard from "../../components/admin/StatCardAdmin";
import UsersTableAdmin from "../../components/admin/UserTableAdmin";
import { useState, useEffect } from "react";
<<<<<<< HEAD

import { useNavigate } from "react-router-dom"; // ✅ added
=======
import { useNavigate } from "react-router-dom";
>>>>>>> 73d6e898a43a265dd1be88dec15dd01123cb3390
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const navigate = useNavigate(); // ✅ added
    const [showUnverified, setShowUnverified] = useState(false); 

  // ✅ fetch users with auth
=======
  const [showUnverified, setShowUnverified] = useState(false);

  const navigate = useNavigate();

  // ✅ Single merged fetchUsers function
>>>>>>> 73d6e898a43a265dd1be88dec15dd01123cb3390
  const fetchUsers = async (filters = {}) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login"); // redirect if not logged in
        return;
      }

      // Merge filters with showUnverified toggle
      const params = { ...filters };
      if (showUnverified) {
        params.isVerified = "all";
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Fetch Users Error:", err.response?.data || err.message);
      setError("Failed to fetch users");

      // redirect if unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

<<<<<<< HEAD
  // ✅ Check token on mount
=======
  // ✅ Fetch users on mount or when showUnverified changes
>>>>>>> 73d6e898a43a265dd1be88dec15dd01123cb3390
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [showUnverified]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="New Users"
              value={users.length.toLocaleString()}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Orders"
              value="200,521"
              color="bg-blue-500"
            />
            <StatCard
              title="Available Products"
              value="215,542"
              color="bg-pink-500"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {/* Toggle for Unverified Users */}
          <div className="mb-4 flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showUnverified}
                onChange={(e) => setShowUnverified(e.target.checked)}
                className="rounded w-4 h-4"
              />
              <span>Show Unverified Users</span>
            </label>
          </div>

          {/* Users Table */}
          <UsersTableAdmin users={users} refreshUsers={fetchUsers} />
        </section>
      </main>
    </div>
  );
}
