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

  /* ==========================
      AUTO FILL USER DATA
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, []);

  /* ==========================
      FETCH SERVICES
  ========================== */
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments/services`);
      const data = await res.json();

      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ==========================
      FETCH SLOTS
  ========================== */
  useEffect(() => {
    if (formData.date && formData.serviceId) {
      fetchSlots();
    }
  }, [formData.date, formData.serviceId]);

  const fetchSlots = async () => {
    try {
      const res = await fetch(
        `${API_URL}/appointments/available-slots/${formData.date}?serviceId=${formData.serviceId}`
      );
      const data = await res.json();

      if (data.success) {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ==========================
      INPUT CHANGE
  ========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "date") {
      setFormData((prev) => ({
        ...prev,
        time: "",
      }));
      setAvailableSlots([]);
    }
  };

  /* ==========================
      SUBMIT APPOINTMENT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const { name, email, phone, serviceId, date, time } = formData;

    if (!name || !email || !phone || !serviceId || !date || !time) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers,
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

      if (!res.ok) {
        throw new Error(data.message || "Booking failed");
      }

      setSuccess(true);

      // Clear only non-auto-filled fields
      setFormData((prev) => ({
        ...prev,
        serviceId: "",
        date: "",
        time: "",
      }));

      setTimeout(() => {
        navigate("/my-appointments");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================
      DATE LIMITS
  ========================== */
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

  /* ==========================
      UI
  ========================== */
  return (
    <section className="relative mt-10 mb-15">
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
        <div
          className="hidden lg:block bg-fixed bg-cover bg-center"
          style={{ backgroundImage: `url(${appointmentImg})` }}
        />

        <div
          className="relative lg:col-span-2 flex items-center justify-center bg-[#060606] text-white px-6 py-20"
          style={{
            backgroundImage: `url(${satelliteMap})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-[#1f2024]/90" />

          <div className="relative w-full max-w-2xl">
            <h2 className="text-4xl font-serif text-[#BB8C4B] mb-6">
              Make an appointment
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded text-green-500">
                Appointment booked successfully
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-6"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-6"
                required
                readOnly // <-- Email auto-filled and read-only
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-6"
                required
              />

              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-6"
                required
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} - {s.pricing}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="h-[56px] bg-white text-black px-6"
                required
              />

              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={!formData.date || availableSlots.length === 0}
                className="h-[56px] bg-white text-black px-6"
              >
                <option value="">
                  {!formData.date
                    ? "Select Time"
                    : availableSlots.length === 0
                    ? "No slots available"
                    : "Select Time"}
                </option>

                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 bg-[#BB8C4B] text-black py-3"
              >
                {loading ? "Booking..." : "Make Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}