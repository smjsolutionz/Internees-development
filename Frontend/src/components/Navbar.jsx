import React, { useState, useEffect } from "react";
import { IoIosLogIn } from "react-icons/io";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import logo from "../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // <-- For profile
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // Fetch profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("accessToken"));
  }, []);

  const handlePackagesClick = () => {
    navigate("/");
    setTimeout(() => {
      const section = document.getElementById("packages");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Who we are", path: "/about" },
    { name: "Deals/Packages", path: "/" },
    { name: "Services We Offer", path: "/services" },
    { name: "Gallery", path: "/cutomergallery" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="w-full border-b border-gray-200 bg-[#222227] z-50 fixed top-0 left-0">
      <div className="max-w-7xl mx-auto container px-4 sm:px-6 lg:px-12">
        <div className="py-3 sm:py-4 flex items-center justify-between">
          {/* LOGO */}
          <img src={logo} alt="Salone Logo" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />

          {/* DESKTOP MENU */}
          <ul className="hidden lg:flex flex-1 justify-center items-center gap-4 xl:gap-6 uppercase text-[14px] lg:text-[15px] font-serif text-[#DDDDDD]">
            {menuItems.map((item) => (
              <li
                key={item.name}
                className="hover:text-[#BB8C4B] cursor-pointer transition"
                onClick={() => {
                  if (item.name === "Deals/Packages") handlePackagesClick();
                  else navigate(item.path);
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 relative">
            {/* If user logged in show avatar */}
            {user ? (
              <div className="relative">
                <img
                    src= "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Profile"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 text-white border-[#BB8C4B] cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#333338] text-white rounded shadow-lg z-50">
                    <button
                      onClick={() => {
                        navigate("/customer/profile");
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#BB8C4B]"
                    >
                      Profile
                    </button>
                    <button
      onClick={() => {
        navigate("/my-appointments");
        setDropdownOpen(false);
      }}
      className="block w-full text-left px-4 py-2 hover:bg-[#BB8C4B]"
    >
      My Appointments
    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-[#BB8C4B]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Show login icon if not logged in
              <div
                className="relative w-10 h-10 sm:w-12 sm:h-12 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <div className="absolute inset-0 border-2 border-[#BB8C4B] rounded-md" />
                <div className="absolute inset-1 border border-[#BB8C4B] rounded-md flex items-center justify-center bg-[#c89b5f] hover:bg-black transition text-white">
                  <IoIosLogIn className="text-xl sm:text-2xl" />
                </div>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button className="lg:hidden text-[#DDDDDD]" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <HiOutlineX className="text-3xl" /> : <HiOutlineMenu className="text-3xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* BACKDROP */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden absolute left-0 w-full bg-[#222227] transform transition-all duration-300 ease-in-out ${
          isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col items-center gap-4 py-6 uppercase text-[14px] font-serif text-[#DDDDDD]">
          {menuItems.map((item) => (
            <li
              key={item.name}
              onClick={() => {
                if (item.name === "Deals/Packages") handlePackagesClick();
                else navigate(item.path);
                setIsOpen(false);
              }}
              className="hover:text-[#BB8C4B] transition cursor-pointer"
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
