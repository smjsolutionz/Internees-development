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
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    // ✅ CUSTOMER / USER
    if (user.role === "customer" || user.role === "user") {
      axios
        .get("http://localhost:5000/api/customer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch(() => navigate("/login"));
    }

    // ✅ ADMIN / STAFF / RECEPTIONIST
    else {
      setProfile(user); // coming from localStorage
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    // Only customers can update profile via this endpoint
    if (profile.role === "customer" || profile.role === "user") {
      axios
        .put("http://localhost:5000/api/customer/profile", profile, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => alert(res.data.message))
        .catch((err) => console.error(err));
    } else {
      alert("Profile update for admin will be added later");
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
            src={profile.avatar || profile.profileImage || "https://i.pravatar.cc/150?img=3"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
          />
          <p className="mt-2 text-sm text-gray-500 capitalize">
            {profile.role}
          </p>
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
            onChange={handleChange}
            className="border p-2 w-full rounded-md"
            disabled
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
          <button
            onClick={handleUpdate}
            className="bg-[#BB8C4B] text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#BB8C4B] text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
