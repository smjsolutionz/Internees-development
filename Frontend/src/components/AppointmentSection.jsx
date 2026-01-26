import React, { useState, useEffect } from "react";
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

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (formData.date && formData.serviceId) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.serviceId]);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/services`,
      );
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/available-slots/${formData.date}?serviceId=${formData.serviceId}`,
      );
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err) {
      console.error("Failed to load time slots:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Reset time when date changes
    if (name === "date") {
      setFormData((prev) => ({ ...prev, time: "" }));
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.serviceId ||
      !formData.date ||
      !formData.time
    ) {
      setError("Please fill in all fields");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // For guests, you might want to redirect to login or handle differently
      setError("Please login to book an appointment");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceId: formData.serviceId,
            appointmentDate: formData.date,
            appointmentTime: formData.time,
            notes: `Name: ${formData.name}, Email: ${formData.email}, Phone: ${formData.phone}`,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceId: "",
        date: "",
        time: "",
      });

      // Redirect to appointments page after 2 seconds
      setTimeout(() => {
        window.location.href = "/my-appointments";
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  return (
    <section className="relative mt-10 mb-15">
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
        {/* LEFT IMAGE */}
        <div
          className="hidden lg:block bg-fixed bg-cover bg-center"
          style={{
            backgroundImage: `url(${appointmentImg})`,
          }}
        />

        {/* RIGHT CONTENT */}
        <div
          className="relative lg:col-span-2 flex items-center justify-center bg-[#060606] text-white px-4 sm:px-6 lg:px-10 py-16 lg:py-24"
          style={{
            backgroundImage: `url(${satelliteMap})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-[#1f2024]/90" />

          <div className="relative w-full max-w-2xl">
            {/* HEADING */}
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-serif text-[#BB8C4B] mb-6 text-center lg:text-left">
              Make an appointment
            </h2>

            <p className="text-gray-400 mb-12 leading-relaxed max-w-lg text-center lg:text-left">
              Our beauty salon provides you with the highest levels of
              professional services for you to love and celebrate yourself even
              more...!
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded text-green-500 text-sm">
                ✓ Appointment booked successfully! Redirecting...
              </div>
            )}

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-6"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Your Phone No"
                value={formData.phone}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full"
                required
              />

              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full"
                required
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - PKR {service.price}
                  </option>
                ))}
              </select>

              {/* Date input */}
              <input
                type="date"
                name="date"
                className="h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full"
                value={formData.date}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
              />

              {/* Time select */}
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`h-[56px] bg-white text-black px-4 sm:px-6 outline-none w-full ${
                  !formData.date || availableSlots.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!formData.date || availableSlots.length === 0}
                required
              >
                <option value="">
                  {!formData.date
                    ? "Select Time"
                    : availableSlots.length === 0
                      ? "Loading slots..."
                      : "Select Time"}
                </option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </form>

            {/* MAKE APPOINTMENT BUTTON */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`
                  group
                  relative
                  px-10 sm:px-12
                  py-3 sm:py-4
                  bg-[#BB8C4B]
                  text-black
                  text-base
                  tracking-widest
                  border
                  border-[#D79A4A]
                  font-medium
                  transition-all
                  duration-300
                  hover:bg-[#A97C42]
                  hover:text-white
                  w-full sm:w-auto
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {loading ? "Booking..." : "Make Appointment"}
                {/* Decorative corners */}
                <span className="absolute -top-2 -left-2 w-7 h-3 border-t-2 border-l-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
                <span className="absolute -top-2 -right-2 w-7 h-3 border-t-2 border-r-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
                <span className="absolute -bottom-2 -left-2 w-7 h-3 border-b-2 border-l-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
                <span className="absolute -bottom-2 -right-2 w-7 h-3 border-b-2 border-r-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
