import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function EditTeamMember() {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/admin/team`);
        const member = data.find((m) => m._id === id);
        if (member) setForm(member);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load team member data.");
      }
    };
    fetchMember();
  }, [id]);

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
      await axios.put(`${API_URL}/admin/team/${id}`, fd);
      navigate("/admin/team");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "No admin user found with this email") {
        setErrorMsg(
          "❌ Email not found. The email you entered is not registered in the system."
        );
      } else if (msg?.includes("Role mismatch")) {
        setErrorMsg(
          "⚠️ Role mismatch. The selected role does not match this user's registered role."
        );
      } else if (msg === "Email already exists in team members") {
        setErrorMsg("❌ Duplicate entry. This email is already a team member.");
      } else {
        setErrorMsg("❌ Something went wrong. Please try again.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!form) return null;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Team Member</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

        {/* Name */}
        <input
          name="name"
          value={form.name || ""}
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          required
          onChange={handleChange}
        />

        {/* Email */}
        <input
          name="email"
          type="email"
          value={form.email || ""}
          placeholder="Email Address"
          className="w-full border p-2 rounded"
          required
          onChange={handleChange}
        />

        {/* Role */}
        <select
          name="role"
          className="w-full border p-2 rounded"
          value={form.role || "STAFF"}
          onChange={handleChange}
          required
        >
          <option value="MANAGER">MANAGER</option>
          <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
          <option value="RECEPTIONIST">RECEPTIONIST</option>
          <option value="STAFF">STAFF</option>
        </select>

        {/* Specialty */}
        <input
          name="specialty"
          value={form.specialty || ""}
          placeholder="Specialty / Designation"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        {/* Status */}
        <select
          name="status"
          value={form.status || "Active"}
          className="w-full border p-2 rounded"
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Image */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {/* Helper text */}
        <p className="text-sm text-gray-500">
          ℹ️ The email must already exist in the system and its role must match
          the selected role.
        </p>

        {/* Submit */}
        <button
          disabled={loading}
          className="bg-[#BB8C4B] text-white px-4 py-2 rounded hover:bg-[#a3733f] transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Update"}
        </button>
      </form>
    </div>
  );
}
