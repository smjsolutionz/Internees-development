import React, { useEffect, useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";

const CustomerGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/gallery/Customer/active")
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching gallery:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* Hero Banner */}
      <div className="relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1319459/pexels-photo-1319459.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#222227]/95 via-[#2d2d2d]/90 to-[#BB8C4B]/85"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="inline-block animate-fade-in mb-6">
            <span className="px-4 py-2 bg-[#BB8C4B]/20 border border-[#BB8C4B]/30 rounded-full text-[#BB8C4B] text-sm font-medium tracking-wider backdrop-blur-sm">
              CUSTOMER GALLERY
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white drop-shadow-lg animate-fade-in-up">
            Explore Our Work
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up-delay mt-4 drop-shadow-sm">
            See how we transform our clients’ looks and create stunning styles
          </p>
        </div>

        <div className="relative">
          <svg
            className="w-full h-16 fill-current text-[#faf8f5]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-12 px-4 mt-16 container max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-[#BB8C4B] border-t-transparent rounded-full"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No images available in the gallery.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((img) => (
                <div
                  key={img._id}
                  className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={`http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`}
                    alt="gallery"
                    className="w-full h-auto md:h-72 lg:h-80 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:blur-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-70 transition flex justify-center items-center cursor-pointer">
                    <div
                      className="bg-[#BB8C4B] p-4 rounded-full flex justify-center items-center transform transition-transform duration-300 group-hover:scale-110"
                      onClick={() =>
                        setSelectedImage(
                          `http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`
                        )
                      }
                    >
                      <FaEye className="text-white text-3xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-500 mt-10">
              Showing {images.length} image{images.length !== 1 ? "s" : ""}
            </p>
          </>
        )}

        {/* Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
            <button
              className="absolute top-5 right-5 text-white text-3xl z-50 hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes />
            </button>
            <img
              src={selectedImage}
              alt="full gallery"
              className="
                w-full max-w-full max-h-[80vh]
                md:max-w-screen-md md:max-h-[90vh]
                lg:max-w-screen-lg lg:max-h-[90vh]
                rounded-2xl shadow-2xl object-contain
                transition-transform duration-500 ease-out scale-0
              "
              onLoad={(e) => e.currentTarget.classList.add("scale-100")}
            />
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out 0.3s backwards; }
        .animate-fade-in-up-delay { animation: fade-in-up 1s ease-out 0.5s backwards; }
      `}</style>
    </div>
  );
};

export default CustomerGallery;