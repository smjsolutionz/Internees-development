import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StockAlertsOverview() {
  const [overview, setOverview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const { data } = await axios.get(`${API_BASE_URL}/api/inventory/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) setOverview(data.overview);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      }
    };

    fetchOverview();
  }, []);

  if (!overview) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Low Stock</p>
          <p className="text-xl font-semibold">{overview.lowStock}</p>
        </div>
        <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-600 text-sm font-medium">
          Low
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Out of Stock</p>
          <p className="text-xl font-semibold">{overview.outOfStock}</p>
        </div>
        <span className="px-3 py-1 rounded bg-red-100 text-red-600 text-sm font-medium">
          Out
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-sm">Total Products</p>
        <p className="text-xl font-semibold">{overview.totalProducts}</p>
      </div>
    </div>
  );
}

