import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();
  const [openGallery, setOpenGallery] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Services", path: "/services-admin" },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] text-white hidden md:flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-center">
        <img src={logo} alt="Logo" className="w-42 object-contain" />
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`w-full block text-left px-4 py-2 rounded-md text-sm ${
              location.pathname === item.path ? "bg-[#BB8C4B]" : "hover:bg-white/10"
            }`}
          >
            {item.name}
          </Link>
        ))}

        {/* Gallery Dropdown */}
        <div>
          <button
            onClick={() => setOpenGallery(!openGallery)}
            className="w-full flex justify-between items-center px-4 py-2 rounded-md hover:bg-white/10 text-sm"
          >
            <span>Gallery</span>
            {openGallery ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          {openGallery && (
            <div className="ml-4 mt-2 space-y-2">
              <Link
                to="/gallery-admin"
                className={`block px-4 py-2 text-sm rounded-md ${
                  location.pathname === "/gallery-admin"
                    ? "bg-[#BB8C4B]"
                    : "hover:bg-white/10"
                }`}
              >
                All Images
              </Link>

              <Link
                to="/gallery-admin/add"
                className={`block px-4 py-2 text-sm rounded-md ${
                  location.pathname === "/gallery-admin/add"
                    ? "bg-[#BB8C4B]"
                    : "hover:bg-white/10"
                }`}
              >
                Add New Image
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
