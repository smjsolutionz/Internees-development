import { useEffect, useState } from "react";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TopbarAdmin({ setSidebarOpen }) {
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  // Safe localStorage parsing
  let storedUser = {};
  try {
    const userStr = localStorage.getItem("user");
    storedUser = userStr ? JSON.parse(userStr) : {};
  } catch (err) {
    console.warn("Invalid user in localStorage, resetting.", err);
    storedUser = {};
  }

  const role = (storedUser.role || "guest").toLowerCase();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle different response shapes safely
        const user = res.data.user || res.data.admin || null;
        setProfilePic(user?.profilePic || null);
      } catch (err) {
        console.error("Failed to load profile pic", err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-black px-4 sm:px-6 py-3 flex items-center justify-between border-b border-white/10 text-white">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="relative w-80 hidden md:block">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="pl-10 pr-4 py-2 w-full rounded-md text-sm 
                     bg-gray-900 text-white border border-white/10 
                     focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />

        <img
          src={profilePic ? `${API_BASE_URL}${profilePic}` : "/avatar.png"}
          onClick={() => navigate(`/${role}/profile`)}
          className="w-8 h-8 rounded-full border border-white/20 cursor-pointer hover:opacity-80"
          alt="User"
        />

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-red-400 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}