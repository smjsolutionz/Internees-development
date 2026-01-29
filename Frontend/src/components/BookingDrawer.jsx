import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function EnhancedBookingDrawer({
  isOpen,
  onClose,
  service,
  price,
  serviceId,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    notes: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-fill user data if logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.name) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, []);

  // Fetch slots when date changes
  useEffect(() => {
    if (formData.date && serviceId) {
      fetchAvailableSlots();
    }
  }, [formData.date, serviceId]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        notes: "",
      });
      setErrors({});
      setAvailableSlots([]);
    }
  }, [isOpen]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments/available-slots/${formData.date}`,
        { params: { serviceId } },
      );

      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots || []);
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load available time slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+92|0)?3[0-9]{9}$/.test(formData.phone.replace(/[-\s]/g, ""))
    ) {
      newErrors.phone = "Invalid phone number (use format: 03XXXXXXXXX)";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Cannot book past dates";
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        serviceId,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        notes: formData.notes.trim(),
      };

      // 🐛 DEBUG LOG - Remove after debugging
      console.log("📤 Sending booking request:", {
        url: `${import.meta.env.VITE_API_BASE_URL}/api/appointments`,
        payload,
        hasToken: !!token,
      });

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/appointments`,
        payload,
        config,
      );

      console.log("✅ Booking response:", response.data);

      if (response.data.success) {
        toast.success(
          "Appointment booked successfully! Check your email for confirmation.",
        );
        onClose();

        setTimeout(() => {
          if (token) {
            window.location.href = "/my-appointments";
          }
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Booking error:", error);

      // 🐛 DETAILED ERROR LOGGING
      if (error.response) {
        console.error("Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error("No Response:", error.request);
      } else {
        console.error("Request Setup Error:", error.message);
      }

      // User-friendly error messages
      let errorMessage = "Failed to book appointment. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);

      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[500px] lg:w-[600px] bg-white z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="relative px-5 sm:px-8 py-6 sm:py-8 border-b text-center">
            <p className="text-[#BB8C4B] tracking-widest uppercase text-xs sm:text-sm mb-2">
              Get Styled
            </p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-black">
              Book An Appointment
            </h3>
            <button
              onClick={onClose}
              className="absolute right-4 sm:right-6 top-4 sm:top-6 hover:bg-gray-100 p-2 rounded-full transition"
              disabled={submitting}
            >
              <IoClose className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
            <div className="border-b pb-4 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Service:</span>{" "}
                <span className="text-[#BB8C4B] font-medium">{service}</span>
              </p>
              <p>
                <span className="font-semibold">Starting Price:</span>{" "}
                <span className="text-[#BB8C4B] font-medium">Rs. {price}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full h-[48px] sm:h-[52px] border px-4 outline-none focus:border-[#BB8C4B] transition ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="Name *"
                disabled={submitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full h-[48px] sm:h-[52px] border px-4 outline-none focus:border-[#BB8C4B] transition ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="Your Email *"
                disabled={submitting}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full h-[48px] sm:h-[52px] border px-4 outline-none focus:border-[#BB8C4B] transition ${
                  errors.phone ? "border-red-500" : ""
                }`}
                placeholder="Your Phone No (03XXXXXXXXX) *"
                disabled={submitting}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className={`w-full h-[48px] sm:h-[52px] border px-4 outline-none focus:border-[#BB8C4B] transition ${
                    errors.date ? "border-red-500" : ""
                  }`}
                  disabled={submitting}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  disabled={!formData.date || loadingSlots || submitting}
                  className={`w-full h-[48px] sm:h-[52px] border px-4 outline-none focus:border-[#BB8C4B] transition ${
                    !formData.date || loadingSlots
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${errors.time ? "border-red-500" : ""}`}
                >
                  <option value="">
                    {loadingSlots
                      ? "Loading slots..."
                      : !formData.date
                        ? "Select date first"
                        : "Select Time *"}
                  </option>
                  {availableSlots.length > 0
                    ? availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatTime(slot)}
                        </option>
                      ))
                    : formData.date &&
                      !loadingSlots && (
                        <option disabled>No slots available</option>
                      )}
                </select>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
            </div>

            <div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border px-4 py-3 outline-none focus:border-[#BB8C4B] transition resize-none"
                placeholder="Additional notes (optional)"
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={
                submitting || (formData.date && availableSlots.length === 0)
              }
              className={`
                group relative w-full mt-6 py-3 sm:py-4
                bg-[#BB8C4B] text-black tracking-widest
                border border-[#D79A4A] font-medium
                transition-all duration-300
                hover:bg-[#A97C42] hover:text-white
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {submitting ? "BOOKING..." : "MAKE APPOINTMENT"}

              <span className="absolute -top-2 -left-2 w-7 h-3 border-t-2 border-l-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
              <span className="absolute -top-2 -right-2 w-7 h-3 border-t-2 border-r-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
              <span className="absolute -bottom-2 -left-2 w-7 h-3 border-b-2 border-l-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
              <span className="absolute -bottom-2 -right-2 w-7 h-3 border-b-2 border-r-2 border-[#D79A4A] transition-all duration-300 group-hover:h-7 group-hover:w-20" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
