import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function PackagesTableAdmin({ packages }) {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  /* ===============================
     DELETE STATES
  =============================== */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePackageId, setDeletePackageId] = useState(null);
  const [deletePackageName, setDeletePackageName] = useState("");

  /* ===============================
     TOGGLE STATUS
  =============================== */
  const toggleStatus = async (id) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoadingId(id);

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

      window.location.reload();
    } catch (error) {
      alert("Server error");
    } finally {
      setLoadingId(null);
    }
  };

  /* ===============================
     DELETE HANDLERS
  =============================== */
  const openDeleteModal = (id, name) => {
    setDeletePackageId(id);
    setDeletePackageName(name);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePackageId(null);
    setDeletePackageName("");
  };

  const handleDeletePackage = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      await fetch(
        `${API_BASE_URL}/api/packages/${deletePackageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeDeleteModal();
      window.location.reload();
    } catch (error) {
      alert("Failed to delete package");
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Packages</h2>
        <button
          onClick={() => navigate("/create-package")}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          <FiPlus /> Create Package
        </button>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <div className="rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-[80px_1.5fr_2fr_1fr_1fr_1fr_1fr] bg-gray-100 text-sm font-semibold px-4 py-3">
            <span>Image</span>
            <span>Name</span>
            <span>Services</span>
            <span>Duration</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-center">Actions</span>
          </div>

          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="grid grid-cols-1 md:grid-cols-[80px_1.5fr_2fr_1fr_1fr_1fr_1fr] gap-2 bg-white px-4 py-4 border-b"
            >
              {/* Image */}
              <div>
                {pkg.image ? (
                  <img
                    src={`${API_BASE_URL.replace("/api", "")}/${pkg.image}`}
                    className="w-14 h-14 rounded object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded" />
                )}
              </div>

              <div className="font-semibold">{pkg.name}</div>

              <ul className="list-disc list-inside text-sm max-h-28 overflow-y-auto">
                {pkg.services.map((s) => (
                  <li key={s._id}>{s.name}</li>
                ))}
              </ul>

              <div className="truncate">{pkg.totalDuration}</div>
              <div className="font-medium truncate">{pkg.price}</div>

              {/* Status */}
              <div>
                <button
                  disabled={loadingId === pkg._id}
                  onClick={() => toggleStatus(pkg._id)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    pkg.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {loadingId === pkg._id
                    ? "Updating..."
                    : pkg.isActive
                    ? "Active"
                    : "Inactive"}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-2">
                <FiEye
                  onClick={() => navigate(`/package-details/${pkg._id}`)}
                  className="cursor-pointer text-amber-600"
                />
                <FiEdit
                  onClick={() => navigate(`/update-package/${pkg._id}`)}
                  className="cursor-pointer text-blue-600"
                />
                <FiTrash2
                  onClick={() => openDeleteModal(pkg._id, pkg.name)}
                  className="cursor-pointer text-red-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col space-y-4">
        {packages.map((pkg) => (
          <div key={pkg._id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex gap-3">
              {pkg.image ? (
                <img
                  src={`${API_BASE_URL.replace("/api", "")}/${pkg.image}`}
                  className="w-14 h-14 rounded object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-200 rounded" />
              )}
              <div>
                <h3 className="font-semibold">{pkg.name}</h3>
                <p className="text-sm text-gray-500">
                  {pkg.totalDuration} | {pkg.price}
                </p>
              </div>
            </div>

            <ul className="list-disc list-inside text-sm max-h-28 overflow-y-auto">
              {pkg.services.map((s) => (
                <li key={s._id}>{s.name}</li>
              ))}
            </ul>

            <div className="flex justify-between items-center">
              <button
                disabled={loadingId === pkg._id}
                onClick={() => toggleStatus(pkg._id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  pkg.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {loadingId === pkg._id
                  ? "Updating..."
                  : pkg.isActive
                  ? "Active"
                  : "Inactive"}
              </button>

              <div className="flex gap-2">
                <FiEye
                  onClick={() => navigate(`/package-details/${pkg._id}`)}
                  className="cursor-pointer text-amber-600"
                />
                <FiEdit
                  onClick={() => navigate(`/update-package/${pkg._id}`)}
                  className="cursor-pointer text-blue-600"
                />
                <FiTrash2
                  onClick={() => openDeleteModal(pkg._id, pkg.name)}
                  className="cursor-pointer text-red-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <b>{deletePackageName}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePackage}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}