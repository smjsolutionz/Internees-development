import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken"); // token stored at login

  // Get profile on page load
  useEffect(() => {
    if (!token) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    axios.get("http://localhost:5000/api/customer/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        navigate("/login");
      });
  }, []);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    axios.put("http://localhost:5000/api/customer/profile", profile, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => alert(res.data.message))
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl mb-4">My Profile</h2>
      
      <div className="mb-3">
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-3">
        <label>Email (cannot edit):</label>
        <input
          type="text"
          value={profile.email || ""}
          disabled
          className="border p-2 w-full bg-gray-100"
        />
      </div>

      <div className="mb-3">
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={profile.phone || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
