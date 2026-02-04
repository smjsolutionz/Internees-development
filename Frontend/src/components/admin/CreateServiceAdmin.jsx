import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CreateServiceAdmin() {
  const navigate = useNavigate();

  /* =======================
     AUTH GUARD
  ======================= */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [service, setService] = useState({
    name: "",
    category: "",
    description: "",
    duration: "",
    pricing: "",
    images: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================
     HANDLERS
  ======================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setService({ ...service, [name]: value });
  };

  const handleImageChange = (e) => {
    setService({ ...service, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("name", service.name);
      formData.append("category", service.category);
      formData.append("description", service.description);
      formData.append("duration", service.duration);
      formData.append("pricing", service.pricing);

      service.images.forEach((img) => formData.append("images", img));

      const { data } = await axios.post(
        `${API_BASE_URL}/api/services`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        navigate("/services-admin", { replace: true });
      } else {
        setError("Failed to create service");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating service");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 w-full">
        <section className="p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-center text-gray-800">
            Create New Service
          </h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6 bg-white p-6 rounded shadow max-w-3xl mx-auto"
          >
            <div>
              <label className="block mb-1 font-medium">Service Name</label>
              <input
                type="text"
                name="name"
                value={service.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Category</label>
              <input
                type="text"
                name="category"
                value={service.category}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={service.description}
                onChange={handleChange}
                className="w-full border p-2 rounded h-28 resize-none"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Duration</label>
              <input
                type="text"
                name="duration"
                value={service.duration}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Price</label>
              <input
                type="text"
                value={service.pricing}
                onChange={(e) =>
                  setService({ ...service, pricing: e.target.value })
                }
                className="w-full sm:w-48 border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Images</label>
              <input type="file" multiple onChange={handleImageChange} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Service"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}