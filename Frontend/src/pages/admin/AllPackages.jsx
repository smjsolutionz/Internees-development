import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ added
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import PackageTableAdmin from "../../components/admin/PackageTableAdmin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AllPackagesAdmin() {
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate(); // ✅ added

  // ✅ FETCH PACKAGES
  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login"); // redirect if not logged in
        return;
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/packages`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      });

      if (data.success) {
        setPackages(data.data);
      } else {
        setError("Failed to fetch packages");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching packages");

      // ✅ redirect if unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-4 sm:p-6">
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {/* Pass packages to table */}
          <PackageTableAdmin packages={packages} />
        </main>
      </div>
    </div>
  );
}