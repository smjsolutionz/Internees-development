import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");

useEffect(() => {
  console.log("Stored token:", token);
  console.log("Stored user:", storedUser);

  if (!token || !storedUser) {
    console.warn("No token or user found. Redirecting to login.");
    navigate("/login", { replace: true });
    return;
  }

  const user = JSON.parse(storedUser);
  const role = user.role?.toUpperCase();
  console.log("Parsed user:", user);
  console.log("User role (normalized):", role);

  const fetchProfile = async () => {
    try {
      const url =
        role === "CUSTOMER"
          ? "http://localhost:5000/api/customer/profile"
          : "http://localhost:5000/api/admin/profile";

      console.log("Fetching profile from URL:", url);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile response:", res.data);

      setProfile(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Profile fetch error:", err.response?.data || err);

      if (err.response?.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      } else {
        setProfile(user); // fallback
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [navigate, token, storedUser]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

 const handleUpdate = async () => {
  const role = profile.role?.toUpperCase();
  const profileRoute =
    role === "CUSTOMER"
      ? "http://localhost:5000/api/customer/profile"
      : "http://localhost:5000/api/admin/profile";

  try {
    const res = await axios.put(profileRoute, {
      name: profile.name,
      username: profile.username,
      phone: profile.phone,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert(res.data.message || "Profile updated successfully");
    localStorage.setItem("user", JSON.stringify(res.data.user || res.data));
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to update profile");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <p className="text-white text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#222227] flex items-start justify-center py-20">
      <div className="max-w-md w-full mt-20 p-6 shadow bg-white rounded-md">
        <h2 className="text-2xl mb-4 text-center">My Profile</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src={profile.avatar || profile.profilePic || profile.profileImage || "https://i.pravatar.cc/150?img=3"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
          />
          <p className="mt-2 text-sm text-gray-500 capitalize">{profile.role}</p>
        </div>

        <div className="mb-3">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded-md"
          />
        </div>

        <div className="mb-3">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={profile.username || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded-md"
          />
        </div>

        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profile.email || ""}
            disabled
            className="border p-2 w-full rounded-md"
          />
        </div>

        <div className="mb-3">
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded-md"
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={handleUpdate} className="bg-[#BB8C4B] text-white px-4 py-2 rounded">
            Save
          </button>
          <button onClick={handleLogout} className="bg-[#BB8C4B] text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;