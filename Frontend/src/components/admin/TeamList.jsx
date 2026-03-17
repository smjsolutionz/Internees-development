import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeamList() {
  const [team, setTeam] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/team`);
      setTeam(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const confirmDelete = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/admin/team/${selectedMember._id}`);
      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchTeam();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Team Members</h1>
        <Link
          to="/admin/team/add"
          className="bg-[#BB8C4B] text-white px-4 py-2 rounded hover:bg-[#a3733f] transition"
        >
          + Add Member
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow rounded border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {team.map((m) => (
              <tr key={m._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {m.profileImage ? (
                    <img
                      src={`${API_URL}/uploads/${m.profileImage}`}
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                      N/A
                    </div>
                  )}
                </td>
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">{m.role}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      m.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="pt-5 flex gap-2">
                  <Link
                    to={`/admin/team/edit/${m._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => confirmDelete(m)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {team.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-4 text-gray-500 italic"
                >
                  No team members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
            <p className="mb-4 text-gray-800">
              Are you sure you want to delete <strong>{selectedMember.name}</strong> 
              <br />(<em>{selectedMember.email}</em>)?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
