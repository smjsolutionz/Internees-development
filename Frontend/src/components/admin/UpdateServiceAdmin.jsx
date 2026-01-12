import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function UpdateServiceAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState({
    name: "",
    category: "",
    description: "",
    duration: "",
    pricing: 0,
    images: [],
  });

  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch service by ID
  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/services`);
        const found = data.data.find((s) => s._id === id);

        if (!found) {
          return alert("Service not found");
        }

        setService({
          name: found.name,
          category: found.category,
          description: found.description,
          duration: found.duration,
          pricing: found.pricing[0], // single price
          images: found.images || [],
        });
      } catch (err) {
        alert("Failed to load service");
      }
    };

    fetchService();
  }, [id]);

  // 🔹 Handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setService({ ...service, [name]: value });
  };

  // 🔹 Handle pricing
  const handlePricingChange = (value) => {
    setService({ ...service, pricing: Number(value) });
  };

  // 🔹 Handle new image upload
  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  // 🔹 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", service.name);
      formData.append("category", service.category);
      formData.append("description", service.description);
      formData.append("duration", service.duration);
      formData.append("pricing", JSON.stringify([service.pricing]));

      // only append images if new ones selected
      newImages.forEach((img) => formData.append("images", img));

      await axios.put(`${API_BASE_URL}/api/services/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/services-admin");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1">
        <section className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Update Service</h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-6 rounded shadow"
          >
            {/* Service Name */}
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

            {/* Category */}
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

            {/* Description */}
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={service.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* Duration */}
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

            {/* Pricing */}
            <div>
              <label className="block mb-1 font-medium">Price</label>
              <input
                type="number"
                value={service.pricing}
                onChange={(e) => handlePricingChange(e.target.value)}
                className="w-32 border p-2 rounded"
                required
              />
            </div>

            {/* Existing Images */}
            {service.images.length > 0 && (
              <div>
                <label className="block mb-1 font-medium">Current Images</label>
                <div className="flex gap-3 flex-wrap">
                  {service.images.map((img, i) => (
                    <img
                      key={i}
                      src={`${API_BASE_URL.replace("/api", "")}/${img}`}
                      alt="service"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <label className="block mb-1 font-medium">
                Replace Images (optional)
              </label>
              <input type="file" multiple onChange={handleImageChange} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Updating..." : "Update Service"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/services-admin")}
                className="bg-gray-400 text-white px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
