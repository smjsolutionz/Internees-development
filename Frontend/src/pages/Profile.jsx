import React, { useEffect, useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken"); 

  
  useEffect(() => {
    if (!token) {
      navigate("/login"); 
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
    
    <div className="min-h-screen bg-[#222227] flex items-start justify-center py-20 ">
    <div className="max-w-md mx-auto mt-20 p-6 border  shadow z-10 bg-white rounded-md">
      <h2 className="text-2xl mb-4">My Profile</h2>
      <div className="flex flex-col items-center mb-6">
  <img
    src={profile.profileImage || "https://i.pravatar.cc/150?img=3"}
    alt="Profile"
    className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
  />
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

      <div className="flex gap-4">
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
