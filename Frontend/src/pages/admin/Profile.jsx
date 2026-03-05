import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ROLE → DASHBOARD */
const getRedirectPathByRole = (role) => {
  if (!role) return "/";

  const r = role.toLowerCase();

  if (r === "admin") return "/dashboard";
  if (r === "manager") return "/manager/dashboard";
  if (r === "inventory_manager") return "/inventory/dashboard";
  if (r === "receptionist") return "/receptionist/dashboard";
  if (r === "staff") return "/staff/dashboard";
  if (r === "customer") return "/";

  return "/";
};

/* ROLE → PROFILE API */
const getProfileEndpoint = (role) => {
  if (!role) return "";

  if (role.toLowerCase() === "customer") {
    return "/api/customer/profile";
  }

  return "/api/admin/profile";
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [removePic, setRemovePic] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* FETCH PROFILE */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    const role = storedUser.role;
    const endpoint = getProfileEndpoint(role);

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = res.data.user || res.data.admin;

        setUser(profileData);
        setForm(profileData);

        localStorage.setItem("user", JSON.stringify(profileData));

      } catch (err) {
        console.error(err);
        localStorage.clear();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  /* INPUT CHANGE */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* LOGOUT */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  /* UPDATE PROFILE */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (form[key] !== undefined && form[key] !== null) {
        formData.append(key, form[key]);
      }
    });

    if (profilePic) formData.append("profilePic", profilePic);
    if (removePic) formData.append("removeProfilePic", "true");

    try {
      const endpoint = getProfileEndpoint(user.role);

      const res = await axios.put(
        `${API_BASE_URL}${endpoint}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedProfile = res.data.user || res.data.admin;

      localStorage.setItem("user", JSON.stringify(updatedProfile));

      alert("Profile updated successfully");

      const redirectPath = getRedirectPathByRole(user.role);

      navigate(redirectPath, { replace: true });

    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <p className="p-6 text-red-500">Failed to load profile</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-sm rounded-lg shadow-lg p-6 space-y-4"
      >
        <h1 className="text-lg font-semibold text-center capitalize">
          {user.role?.replace("_", " ")} Profile
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
                ? `${API_BASE_URL.replace("/api", "")}${user.profilePic}`
                : "/avatar.png"
            }
            alt="Profile"
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

        {user.role?.toLowerCase() === "admin" && (
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
        )}

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

/* INPUT COMPONENT */
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