import { useEffect, useState } from "react";
import axios from "axios";

export default function WalkInAppointmentForm() {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    serviceId: "",
    packageId: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  const BACKEND_URL = "http://localhost:5000";

  /* ===============================
     FETCH SERVICES & PACKAGES
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const res = await axios.get(
          `${BACKEND_URL}/api/receptionist/walkin/services`
        );
        setServices(res.data.services || []);
        setPackages(res.data.packages || []);
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load services/packages");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     FETCH AVAILABLE SLOTS
  =============================== */
  useEffect(() => {
    const fetchSlots = async () => {
      if (
        (!formData.serviceId && !formData.packageId) ||
        !formData.appointmentDate
      ) {
        setSlots([]);
        return;
      }

      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/receptionist/walkin/slots/${formData.appointmentDate}`
        );

        const { allSlots = [], bookedSlots = [] } = res.data;

        const mappedSlots = allSlots.map((slot) => ({
          time: slot,
          booked: bookedSlots.includes(slot),
        }));

        setSlots(mappedSlots);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setSlots([]);
      }
    };

    fetchSlots();
  }, [formData.serviceId, formData.packageId, formData.appointmentDate]);

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "serviceId" && value && { packageId: "" }),
      ...(name === "packageId" && value && { serviceId: "" }),
    }));
  };

  /* ===============================
     HANDLE SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${BACKEND_URL}/api/receptionist/walkin/appointments`,
        {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          serviceId: formData.serviceId || null,
          packageId: formData.packageId || null,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
        }
      );

      setMessage("✅ Walk-in appointment created successfully!");

      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        serviceId: "",
        packageId: "",
        appointmentDate: "",
        appointmentTime: "",
      });

      setSlots([]);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.errors) {
        const errorMessages = Object.values(
          err.response.data.errors
        ).join(", ");
        setMessage("❌ " + errorMessages);
      } else {
        setMessage(
          err.response?.data?.message || "❌ Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white p-5 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Walk-In Appointment
        </h2>

        {message && (
          <div className="mb-4 text-sm font-medium text-center text-red-600 bg-red-50 p-2 rounded">
            {message}
          </div>
        )}

        {fetching ? (
          <p className="text-gray-500 text-center">
            Loading services and packages...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Customer Name"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
                required
              />

              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="Customer Email"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
              />
            </div>

            <input
              type="text"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="Customer Phone"
              className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                name="packageId"
                value={formData.packageId}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
              >
                <option value="">Select Package</option>
                {packages.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
                required
              />

              <select
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-[#BB8C4B] outline-none"
                required
                disabled={slots.length === 0}
              >
                <option value="">Select Time Slot</option>
                {slots.length > 0 ? (
                  slots.map((slot) => (
                    <option
                      key={slot.time}
                      value={slot.time}
                      disabled={slot.booked}
                    >
                      {slot.time} {slot.booked ? "(Booked)" : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>No available slots</option>
                )}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BB8C4B] hover:bg-[#a8793d] transition duration-300 text-white p-3 rounded-lg font-semibold"
            >
              {loading ? "Creating..." : "Create Walk-In Appointment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
