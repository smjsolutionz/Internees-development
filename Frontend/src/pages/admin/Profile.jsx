import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ProfilePage() {
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [removePic, setRemovePic] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔐 PROTECT PAGE + FETCH PROFILE
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAdmin(res.data.admin);
        setForm(res.data.admin);
      } catch (err) {
        // token invalid or expired
        localStorage.removeItem("accessToken");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚪 LOGOUT (CLEAR HISTORY)
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // 💾 SAVE PROFILE
 const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");
  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    if (form[key]) formData.append(key, form[key]);
  });

  if (profilePic) {
    formData.append("profilePic", profilePic);
  }

  if (removePic) {
    formData.append("removeProfilePic", "true");
  }

  try {
    await axios.put(
      `${API_BASE_URL}/api/admin/profile`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Redirect to dashboard after save
    navigate("/dashboard", { replace: true });
  } catch (error) {
    alert("Profile update failed");
  }
};

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm rounded-lg shadow-lg p-6 space-y-4"
      >
        <h1 className="text-lg font-semibold text-center">My Profile</h1>

        {/* PROFILE PICTURE */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={
              removePic
                ? "/avatar.png"
                : profilePic
                ? URL.createObjectURL(profilePic)
                : admin.profilePic
                ? `${API_BASE_URL}${admin.profilePic}`
                : "/avatar.png"
            }
            className="w-24 h-24 rounded-full object-cover border"
          />

          <div className="flex gap-4 text-sm">
            <label className="cursor-pointer text-blue-600">
              Change
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  setProfilePic(e.target.files[0]);
                  setRemovePic(false);
                }}
              />
            </label>

            {admin.profilePic && !removePic && (
              <button
                type="button"
                className="text-red-500"
                onClick={() => {
                  setProfilePic(null);
                  setRemovePic(true);
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <Input label="Name" name="name" value={form.name || ""} onChange={handleChange} />
        <Input label="Username" name="username" value={form.username || ""} onChange={handleChange} />
        <Input label="Email (cannot edit)" value={form.email || ""} disabled />
        <Input label="Phone" name="phone" value={form.phone || ""} onChange={handleChange} />

        {/* BIO */}
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio || ""}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
          >
            Save
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        {...props}
        className="w-full border rounded p-2 text-sm disabled:bg-gray-100"
      />
    </div>
  );
}