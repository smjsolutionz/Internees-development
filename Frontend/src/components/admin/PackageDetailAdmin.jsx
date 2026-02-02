import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PackageDetailsAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     ADMIN AUTH GUARD
  =============================== */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchPackage(token);
  }, [id, navigate]);

  /* ===============================
     FETCH PACKAGE
  =============================== */
  const fetchPackage = async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/packages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const found = res.data.data.find((p) => p._id === id);
      if (!found) {
        navigate("/packages-admin", { replace: true });
        return;
      }

      setPkg(found);
    } catch (err) {
      console.error(err);
      navigate("/login", { replace: true });
    }
  };

  /* ===============================
     TOGGLE STATUS
  =============================== */
  const toggleStatus = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/packages/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to update status");
        return;
      }

      await fetchPackage(token); // refresh data
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     LOADING STATE
  =============================== */
  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-10">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Package Details
          </h2>
          <button
            onClick={() => navigate("/packages-admin")}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition w-full sm:w-auto"
          >
            Back
          </button>
        </div>

        {/* Main Info */}
        <div className="flex flex-col md:flex-row gap-6">
          {pkg.image && (
            <img
              src={`${API_BASE_URL}/${pkg.image}`}
              alt={pkg.name}
              className="w-full md:w-1/2 h-60 md:h-72 object-cover rounded border"
            />
          )}

          <div className="flex-1 space-y-3">
            <p><b>Name:</b> {pkg.name}</p>
            <p><b>Total Duration:</b> {pkg.totalDuration}</p>
            <p><b>Price:</b> {pkg.price}</p>

            {/* Status Toggle */}
            <p className="flex items-center gap-2">
              <b>Status:</b>
              <button
                disabled={loading}
                onClick={toggleStatus}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  pkg.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {loading
                  ? "Updating..."
                  : pkg.isActive
                  ? "Active"
                  : "Inactive"}
              </button>
            </p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-3">
            Included Services
          </h3>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full border rounded table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Service</th>
                  <th className="p-3 text-left">Duration</th>
                  <th className="p-3 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {pkg.services.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.duration || "—"}</td>
                    <td className="p-3">{s.pricing || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 mt-4">
            {pkg.services.map((s) => (
              <div
                key={s._id}
                className="border rounded p-3 bg-gray-50"
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-sm">
                  <b>Duration:</b> {s.duration || "—"}
                </p>
                <p className="text-sm">
                  <b>Price:</b> {s.pricing || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => navigate(`/update-package/${pkg._id}`)}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Update Package
          </button>
          <button
            onClick={() => navigate("/packages-admin")}
            className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 transition w-full sm:w-auto"
          >
            Back to List
          </button>
        </div>

      </div>
    </div>
  );
}