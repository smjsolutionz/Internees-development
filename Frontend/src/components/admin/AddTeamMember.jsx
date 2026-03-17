import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddTeamMember() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "STAFF",
    specialty: "",
    status: "Active",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("profileImage", image);

    try {
      await axios.post(`${API_URL}/admin/team`, fd);
      navigate("/admin/team");
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg === "No admin user found with this email") {
        setErrorMsg(
          "❌ Email not found: The email you entered is not registered in the system."
        );
      } else if (msg?.includes("Role mismatch")) {
        setErrorMsg(
          "⚠️ Role mismatch: This email belongs to a different role. Please select the correct role."
        );
      } else if (msg === "Email already exists in team members") {
        setErrorMsg("❌ Duplicate entry: This email is already added as a team member.");
      } else {
        setErrorMsg("❌ Something went wrong. Please try again.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Team Member</h1>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          required
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          className="w-full border p-2 rounded"
          required
          onChange={handleChange}
        />

        <select
          name="role"
          className="w-full border p-2 rounded"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="MANAGER">MANAGER</option>
          <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
          <option value="RECEPTIONIST">RECEPTIONIST</option>
          <option value="STAFF">STAFF</option>
        </select>

        <input
          name="specialty"
          placeholder="Specialty / Designation"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <select
          name="status"
          className="w-full border p-2 rounded"
          value={form.status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <p className="text-sm text-gray-500">
          ℹ️ The email must already exist in the system and its role must match
          the selected role.
        </p>

        <button
          disabled={loading}
          className="bg-[#BB8C4B] text-white px-4 py-2 rounded hover:bg-[#a3733f] transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
