import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PROFILE_API_BY_ROLE = {
  super_admin: "/api/super-admin/profile",
  admin: "/api/admin/profile",
  manager: "/api/manager/profile",
  staff: "/api/staff/profile",
  receptionist: "/api/reception/profile",
  inventory_manager: "/api/inventory-manager/profile",
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [removePic, setRemovePic] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

 useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!token || !storedUser) {
    navigate("/login", { replace: true });
    return;
  }

  const role = storedUser.role?.toLowerCase();
  const profileApi = PROFILE_API_BY_ROLE[role];

  if (!profileApi) {
    navigate("/", { replace: true });
    return;
  }

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${profileApi}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user || res.data.admin);
      setForm(res.data.user || res.data.admin);
    } catch (err) {
      console.error("Profile fetch error:", err);
      localStorage.clear();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [navigate]);


  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");
  const role = user.role.toLowerCase();
  const profileApi = PROFILE_API_BY_ROLE[role]; // Use correct role-based API

  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    if (form[key]) formData.append(key, form[key]);
  });

  if (profilePic) formData.append("profilePic", profilePic);
  if (removePic) formData.append("removeProfilePic", "true");

  try {
    await axios.put(`${API_BASE_URL}${profileApi}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    navigate("/dashboard", { replace: true });
  } catch (err) {
    console.error("Profile update error:", err.response || err);
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
        <h1 className="text-lg font-semibold text-center capitalize">
          {user.role.replace("_", " ")} Profile
        </h1>

        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center gap-2">
          <img
            src={
              removePic
                ? "/avatar.png"
                : profilePic
                ? URL.createObjectURL(profilePic)
                : user.profilePic
                ? `${API_BASE_URL}${user.profilePic}`
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

            {user.profilePic && !removePic && (
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
        <Input label="Email" value={form.email || ""} disabled />
        <Input label="Phone" name="phone" value={form.phone || ""} onChange={handleChange} />

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

        <div className="flex gap-3 pt-2">
          <button className="flex-1 bg-yellow-600 text-white py-2 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 bg-gray-700 text-white py-2 rounded"
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
