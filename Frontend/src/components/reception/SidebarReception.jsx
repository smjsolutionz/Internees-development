import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import axios from "axios";
import logo from "../../assets/images/logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SidebarReception({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await axios.get(
          `${API_BASE_URL}/api/admin/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(res.data.admin);
      } catch (err) {
        console.error("Reception profile load failed", err);
      }
    };

    fetchProfile();
  }, []);

  const menu = [
    { name: "Dashboard", path: "/reception" },
    { name: "Appointments", path: "/reception/appointments" },
    { name: "Customers", path: "/reception/customers" },
    { name: "Billing", path: "/reception/billing" },
  ];

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 bottom-0 z-50 w-64 
        bg-black text-white border-r border-white/10 
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <img src={logo} alt="Logo" className="w-32" />
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X />
          </button>
        </div>

        {/* Profile Section */}
        {user && (
          <Link
            to="/reception/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex flex-col items-center py-6 border-b border-white/10 hover:bg-white/5 transition"
          >
            <img
              src={
                user.profilePic
                  ? `${API_BASE_URL}${user.profilePic}`
                  : "/avatar.png"
              }
              alt="User"
              className="w-16 h-16 rounded-full object-cover border mb-2"
            />
            <h4 className="font-semibold">{user.name}</h4>
            <span className="text-xs text-gray-400">{user.role}</span>
            <span className="text-xs text-[#BB8C4B] mt-1">
              View Profile
            </span>
          </Link>
        )}

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === item.path
                  ? "bg-[#BB8C4B]"
                  : "hover:bg-white/10"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
