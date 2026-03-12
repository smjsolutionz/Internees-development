import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Scissors,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  Mail,
} from "lucide-react";

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService]);

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
      setError("Failed to load services");
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/appointments/available-slots/${selectedDate}?serviceId=${selectedService._id}`,
      );
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.availableSlots);
      }
    } catch (err) {
      setError("Failed to load time slots");
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
    setError("");
  };

  const handleDateSelect = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime("");
    setError("");
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Please login to book an appointment");
      setLoading(false);
      return;
    }

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
            serviceId: selectedService._id,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            notes: notes.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to book appointment");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/my-appointments";
      }, 3000);
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

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #222227 0%, #303133 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Book Your Appointment
          </h1>
          <p className="text-sm" style={{ color: "#999999" }}>
            Diamond Trim Beauty Studio
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                    step >= s ? "text-black" : "text-gray-500"
                  }`}
                  style={{
                    background:
                      step >= s
                        ? "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)"
                        : "#777777",
                  }}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className="w-12 h-1"
                    style={{
                      background:
                        step > s
                          ? "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)"
                          : "#777777",
                    }}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg flex items-start gap-2 max-w-2xl mx-auto"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderWidth: "1px",
              borderColor: "#ef4444",
            }}
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#ef4444" }}
            />
            <p className="text-sm" style={{ color: "#ef4444" }}>
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="mb-4 p-4 rounded-lg flex items-start gap-2 max-w-2xl mx-auto"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: "1px",
              borderColor: "#22c55e",
            }}
          >
            <CheckCircle
              className="w-6 h-6 flex-shrink-0"
              style={{ color: "#22c55e" }}
            />
            <div>
              <p className="font-medium mb-1" style={{ color: "#22c55e" }}>
                Appointment Booked Successfully!
              </p>
              <p className="text-sm" style={{ color: "#999999" }}>
                Redirecting to your appointments...
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <h2
              className="text-2xl font-bold text-center mb-6"
              style={{ color: "#FFFFFF" }}
            >
              Select a Service
            </h2>
            {Object.keys(groupedServices).map((category) => (
              <div key={category}>
                <h3
                  className="text-lg font-semibold mb-3 px-4"
                  style={{ color: "#BB8C4B" }}
                >
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedServices[category].map((service) => (
                    <button
                      key={service._id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-4 rounded-lg border-2 transition-all text-left hover:scale-105"
                      style={{
                        backgroundColor: "#303133",
                        borderColor:
                          selectedService?._id === service._id
                            ? "#BB8C4B"
                            : "#777777",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Scissors
                          className="w-6 h-6 flex-shrink-0 mt-1"
                          style={{ color: "#BB8C4B" }}
                        />
                        <div className="flex-1">
                          <h4
                            className="font-semibold mb-1"
                            style={{ color: "#FFFFFF" }}
                          >
                            {service.name}
                          </h4>
                          <p
                            className="text-sm mb-2"
                            style={{ color: "#999999" }}
                          >
                            {service.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span
                              className="text-sm"
                              style={{ color: "#DDDDDD" }}
                            >
                              {service.duration} min
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: "#BB8C4B" }}
                            >
                              PKR {service.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#303133",
                borderWidth: "1px",
                borderColor: "rgba(187, 140, 75, 0.2)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "#FFFFFF" }}
              >
                Select Date & Time
              </h2>

              {/* Selected Service Summary */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{
                  backgroundColor: "#222227",
                  borderLeft: "4px solid #BB8C4B",
                }}
              >
                <p className="text-sm mb-1" style={{ color: "#999999" }}>
                  Selected Service
                </p>
                <p className="font-semibold" style={{ color: "#FFFFFF" }}>
                  {selectedService.name}
                </p>
                <div
                  className="flex gap-4 mt-2 text-sm"
                  style={{ color: "#DDDDDD" }}
                >
                  <span>{selectedService.duration} min</span>
                  <span>PKR {selectedService.price}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#DDDDDD" }}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateSelect}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full rounded-lg py-3 px-4 focus:outline-none"
                  style={{
                    backgroundColor: "#222227",
                    borderWidth: "1px",
                    borderColor: "#777777",
                    color: "#FFFFFF",
                  }}
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label
                    className="block text-sm font-medium mb-3"
                    style={{ color: "#DDDDDD" }}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Available Time Slots
                  </label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => handleTimeSelect(slot)}
                          className="py-2 px-4 rounded-lg font-medium transition-all"
                          style={{
                            backgroundColor:
                              selectedTime === slot ? "#BB8C4B" : "#222227",
                            borderWidth: "1px",
                            borderColor:
                              selectedTime === slot ? "#BB8C4B" : "#777777",
                            color:
                              selectedTime === slot ? "#222227" : "#FFFFFF",
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-center py-4"
                      style={{ color: "#999999" }}
                    >
                      No available slots for this date
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg font-bold"
                  style={{ backgroundColor: "#777777", color: "#FFFFFF" }}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Notes */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "#303133",
                borderWidth: "1px",
                borderColor: "rgba(187, 140, 75, 0.2)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "#FFFFFF" }}
              >
                Confirm Appointment
              </h2>

              {/* Appointment Summary */}
              <div className="space-y-4 mb-6">
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#222227" }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Scissors
                      className="w-5 h-5 mt-1"
                      style={{ color: "#BB8C4B" }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: "#999999" }}>
                        Service
                      </p>
                      <p className="font-semibold" style={{ color: "#FFFFFF" }}>
                        {selectedService.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <Calendar
                      className="w-5 h-5 mt-1"
                      style={{ color: "#BB8C4B" }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: "#999999" }}>
                        Date
                      </p>
                      <p className="font-semibold" style={{ color: "#FFFFFF" }}>
                        {new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <Clock
                      className="w-5 h-5 mt-1"
                      style={{ color: "#BB8C4B" }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: "#999999" }}>
                        Time
                      </p>
                      <p className="font-semibold" style={{ color: "#FFFFFF" }}>
                        {selectedTime}
                      </p>
                    </div>
                  </div>
                  <div
                    className="pt-3 mt-3"
                    style={{ borderTop: "1px solid #777777" }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: "#999999" }}>
                        Total Amount
                      </span>
                      <span
                        className="text-xl font-bold"
                        style={{ color: "#BB8C4B" }}
                      >
                        PKR {selectedService.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#DDDDDD" }}
                  >
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Any special requests or requirements..."
                    className="w-full rounded-lg p-3 focus:outline-none resize-none"
                    style={{
                      backgroundColor: "#222227",
                      borderWidth: "1px",
                      borderColor: "#777777",
                      color: "#FFFFFF",
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: "#999999" }}>
                    {notes.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-lg font-bold"
                  style={{ backgroundColor: "#777777", color: "#FFFFFF" }}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg font-bold transition-all"
                  style={{
                    background: loading
                      ? "#777777"
                      : "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
                    color: "#222227",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
