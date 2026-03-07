import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StatCard from "../admin/StatCardAdmin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AttendanceOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const { data } = await axios.get(`${API_BASE_URL}/api/attendance/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) setOverview(data.overview);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading || !overview) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Present Today" value={overview.present} color="bg-green-500" />
      <StatCard title="Absent Today" value={overview.absent} color="bg-red-500" />
      <StatCard title="On Leave" value={overview.leave} color="bg-blue-500" />
      <StatCard title="Missed Checkout" value={overview.missedCheckout} color="bg-amber-500" />
    </div>
  );
}
