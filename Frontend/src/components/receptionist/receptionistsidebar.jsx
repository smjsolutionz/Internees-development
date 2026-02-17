import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function SidebarReceptionist({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [openGallery, setOpenGallery] = useState(false);
  const [openServices, setOpenServices] = useState(false);

  // Sidebar menu for receptionist
  const menu = [
    { name: "Dashboard", path: "/receptionist/dashboard" },
    { name: "Appointments", path: "/receptionist/appointments" },
    { name: "Walk-In Appointment", path: "/receptionist/walkin" }, // ✅ New Link
    { name: "Reviews", path: "/receptionist/reviews" },
  ];

  return (
    <>
      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {/* Main Links */}
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

          {/* Gallery Dropdown */}
          <div>
            <button
              onClick={() => setOpenGallery(!openGallery)}
              className="w-full flex justify-between px-4 py-2 rounded-md hover:bg-white/10 text-sm font-medium mt-2"
            >
              <span>Gallery</span>
              {openGallery ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {openGallery && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/receptionist/gallery"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-white/10 rounded-md"
                >
                  All Images
                </Link>
                <Link
                  to="/receptionist/gallery/add"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-white/10 rounded-md"
                >
                  Add New Image
                </Link>
              </div>
            )}
          </div>

          {/* Services & Packages Dropdown */}
          <div>
            <button
              onClick={() => setOpenServices(!openServices)}
              className="w-full flex justify-between px-4 py-2 rounded-md hover:bg-white/10 text-sm font-medium mt-2"
            >
              <span>Services & Packages</span>
              {openServices ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {openServices && (
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/receptionist/services"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-white/10 rounded-md"
                >
                  Services
                </Link>
                <Link
                  to="/receptionist/packages"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-4 py-2 text-sm hover:bg-white/10 rounded-md"
                >
                  Packages
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
