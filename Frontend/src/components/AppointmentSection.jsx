import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import appointmentImg from "../assets/images/appointment.jpg";
import satelliteMap from "../assets/images/satellite-map.png";

export default function AppointmentSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: "",
    date: "",
    time: "",
  });
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();


  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
 useEffect(() => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user?.email) {
    setFormData(prev => ({
      ...prev,
      email: user.email,
      name: user.name || "",
      phone: user.phone || ""
    }));
  }
}, []);



  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch available slots when date or service changes
  useEffect(() => {
    if (formData.date && formData.serviceId) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.serviceId]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/services`);
      const data = await res.json();
      if (data.success) setServices(data.services);
      else console.error("Failed to fetch services:", data.message);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const res = await fetch(
        `${API_URL}/appointments/available-slots/${formData.date}?serviceId=${formData.serviceId}`
      );
      const data = await res.json();
      if (data.success) setAvailableSlots(data.availableSlots);
      else console.error("Failed to fetch slots:", data.message);
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "date") {
      setFormData((prev) => ({ ...prev, time: "" }));
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
     const token = localStorage.getItem("accessToken");

  // ❌ If not logged in
  if (!token) {
    setError("Please login first to book an appointment.");
    setTimeout(() => navigate("/login"), 1500);
    return;
  }
     const user = JSON.parse(localStorage.getItem("user"));
  if (user?.email !== formData.email) {
    setError("Please use the email you logged in with.");
    return; // stops submission
  }

    // Basic validation
    const { name, email, phone, serviceId, date, time } = formData;
    if (!name || !email || !phone || !serviceId || !date || !time) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          appointmentDate: date,
          appointmentTime: time,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          notes: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Booking failed");

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceId: "",
        date: "",
        time: "",
      });

      setTimeout(() => window.location.href = "/my-appointments", 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  };

  return (
    <section className="relative mt-10 mb-15">
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
        <div
          className="hidden lg:block bg-fixed bg-cover bg-center"
          style={{ backgroundImage: `url(${appointmentImg})` }}
        />
        <div
          className="relative lg:col-span-2 flex items-center justify-center bg-[#060606] text-white px-4 sm:px-6 lg:px-10 py-16 lg:py-24"
          style={{
            backgroundImage: `url(${satelliteMap})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-[#1f2024]/90" />
          <div className="relative w-full max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-serif text-[#BB8C4B] mb-6 text-center lg:text-left">
              Make an appointment
            </h2>


            <p className="text-gray-400 mb-12 leading-relaxed max-w-lg text-center lg:text-left">
              Our beauty salon provides you with the highest levels of professional services.
            </p>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">{error}</div>}
            {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded text-green-500 text-sm">✓ Appointment booked successfully! Redirecting...</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-6">
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full" required />

              <input
  type="email"
  name="email"
  placeholder="Email"
  value={formData.email}
  readOnly={!!localStorage.getItem("accessToken")}
  className={`h-[56px] px-4 sm:px-6 outline-none w-full text-black ${
    localStorage.getItem("accessToken")
      ? "bg-gray-200 cursor-not-allowed"
      : "bg-white"
  }`}
  required
/>


              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full" required />

              <select name="serviceId" value={formData.serviceId} onChange={handleChange} className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full" required>
                <option value="">Select Service</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name}  {s.pricing}</option>)}
              </select>

              <input type="date" name="date" value={formData.date} onChange={handleChange} min={getMinDate()} max={getMaxDate()} className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full" required />

              <select name="time" value={formData.time} onChange={handleChange} disabled={!formData.date || availableSlots.length === 0} className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full">
                <option value="">{!formData.date ? "Select Time" : availableSlots.length === 0 ? "No slots available" : "Select Time"}</option>
                {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </form>

            <div className="mt-8 flex justify-center lg:justify-start">
              <button onClick={handleSubmit} disabled={loading} className="px-10 py-3 bg-[#BB8C4B] text-black border border-[#D79A4A] font-medium transition-all duration-300 hover:bg-[#A97C42] hover:text-white w-full sm:w-auto">
                {loading ? "Booking..." : "Make Appointment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}