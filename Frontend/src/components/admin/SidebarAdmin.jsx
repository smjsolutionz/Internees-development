import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import logo from "../../assets/images/logo.png";
import { roleMenus } from "../../config/roleMenu";
import { getProfileRoute } from "../../utils/getProfileRoutes";




const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SidebarAdmin({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [user, setUser] = useState(null); // profile data
  const [dropdownState, setDropdownState] = useState({}); 

  // Get role from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const role = (storedUser.role || "guest").toLowerCase();

 useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const role = storedUser?.role?.toLowerCase();

      let endpoint = "";

      if (role === "customer") {
        endpoint = "/api/customer/profile";
      } else {
        endpoint = "/api/admin/profile";
      }

      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user || res.data.admin);
    } catch (err) {
      console.error("Sidebar profile load failed", err);
      setUser(null);
    }
  };

  fetchProfile();
}, []);



  const menu = roleMenus[role] || [];

  const toggleDropdown = (name) => {
    setDropdownState((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 bottom-0 z-50 w-64 bg-black text-white border-r border-white/10 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <img src={logo} alt="Logo" className="w-32" />
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        {/* Profile */}
        {user && (
          <Link to={getProfileRoute()}
            onClick={() => setSidebarOpen(false)}
            className="flex flex-col items-center py-6 border-b border-white/10 hover:bg-white/5 transition"
          >
            <img
              src={user.profilePic ? `${API_BASE_URL}${user.profilePic}` : "/avatar.png"}
              alt={user.name || "User"}
              className="w-16 h-16 rounded-full object-cover border mb-2"
            />
            <h4 className="font-semibold">{user.name || "User"}</h4>
            <span className="text-xs text-gray-400">{role}</span>
            <span className="text-xs text-[#BB8C4B] mt-1">View Profile</span>
          </Link>
        )}

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menu.map((item) =>
            item.dropdown ? (
              <div key={item.name}>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className="w-full flex justify-between items-center px-4 py-2 rounded-md hover:bg-white/10 text-sm font-medium mt-2"
                >
                  <span>{item.name}</span>
                  {dropdownState[item.name] ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {dropdownState[item.name] &&
                  item.dropdown.map((sub) => (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`block px-4 py-2 text-sm rounded-md ml-4 ${
                        location.pathname === sub.path ? "bg-[#BB8C4B]" : "hover:bg-white/10"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
              </div>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path ? "bg-[#BB8C4B]" : "hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
