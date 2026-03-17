import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";

export default function BookingDrawer({ isOpen, onClose, service, serviceId, packageId, price }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: "",
    packageId: "",
    date: "",
    time: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!token && !!user?.email;

  // Prefill user data
  useEffect(() => {
    if (isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        serviceId: serviceId || "",
        packageId: packageId || "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        serviceId: serviceId || "",
        packageId: packageId || "",
      }));
    }
  }, [serviceId, packageId, isLoggedIn]);

  // Fetch slots (same logic as AppointmentSection)
  const fetchAvailableSlots = async () => {
    if (!formData.date) return;
    setLoadingSlots(true);
    try {
      let url = `${API_URL}/appointments/available-slots/${formData.date}?`;
      if (formData.serviceId) url += `serviceId=${formData.serviceId}`;
      else if (formData.packageId) url += `packageId=${formData.packageId}`;

      const res = await fetch(url);
      const data = await res.json();
      setAvailableSlots(data.success ? data.availableSlots || [] : []);
    } catch (err) {
      console.error(err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [formData.date, formData.serviceId, formData.packageId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "date" || name === "serviceId" || name === "packageId") {
      setFormData(prev => ({ ...prev, time: "" }));
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login first to book an appointment");
      return;
    }

    if (!formData.serviceId && !formData.packageId) {
      toast.error("Please select a service or package");
      return;
    }

    if (!formData.date || !formData.time) {
      toast.error("Please select a date and time");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        notes: "",
      };

      if (formData.serviceId) payload.serviceId = formData.serviceId;
      if (formData.packageId) payload.packageId = formData.packageId;

      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      toast.success("Appointment booked successfully!");

      // Reset only service/package/date/time, keep user info
      setFormData(prev => ({
        ...prev,
        serviceId: "",
        packageId: "",
        date: "",
        time: "",
      }));

      fetchAvailableSlots(); // refresh slots

    } catch (err) {
      toast.error(err.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
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
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/50 z-40 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} />
      <div className={`fixed top-0 right-0 h-screen w-full sm:w-[500px] lg:w-[600px] bg-white z-50 transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full overflow-y-auto">
          <div className="relative px-6 py-6 border-b text-center">
            <h3 className="text-2xl font-serif">Book An Appointment</h3>
            <button onClick={onClose} className="absolute right-4 top-4"><IoClose className="text-2xl" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <p><b>Service/Package:</b> <span className="text-[#BB8C4B]">{service}</span></p>
            <p><b>Price:</b> <span className="text-[#BB8C4B]">Rs. {price}</span></p>

            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border px-4 h-[48px]" disabled={submitting} />
            <input type="email" name="email" value={formData.email} placeholder="Email" readOnly={isLoggedIn} className={`w-full border px-4 h-[48px] ${isLoggedIn ? "bg-gray-200 cursor-not-allowed" : ""}`} />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full border px-4 h-[48px]" />

            <div className="grid grid-cols-2 gap-4">
              <input type="date" name="date" value={formData.date} onChange={handleChange} min={getMinDate()} max={getMaxDate()} className="w-full border px-4 h-[48px]" />
              <select name="time" value={formData.time} onChange={handleChange} disabled={!formData.date || availableSlots.length === 0} className="w-full border px-4 h-[48px]">
                <option value="">
                  {!formData.date ? "Select Date" : loadingSlots ? "Loading..." : availableSlots.length === 0 ? "No slots" : "Select Time"}
                </option>
                {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-[#BB8C4B] py-3 border border-[#D79A4A]">
              {submitting ? "Booking..." : "Make Appointment"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
