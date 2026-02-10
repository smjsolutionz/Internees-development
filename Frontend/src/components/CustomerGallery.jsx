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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="relative">
          <div className="animate-spin h-16 w-16 border-4 border-[#BB8C4B] border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-[#BB8C4B] border-t-transparent rounded-full opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Hero Section with Salon Background */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Our Gallery
          </h1>
          <div className="w-24 h-1 bg-[#BB8C4B] mb-6"></div>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed">
            Explore our curated collection of stunning transformations and salon moments
          </p>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <svg 
              className="w-6 h-6 text-white/80" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-16 px-4 max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-32">
            <div className="mb-6">
              <svg 
                className="w-24 h-24 mx-auto text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Images Yet</h3>
            <p className="text-gray-500">Check back soon for new additions to our gallery</p>
          </div>
        ) : (
          <>
            {/* Gallery Stats */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
                <span className="text-[#BB8C4B] font-bold text-lg">{images.length}</span>
                <span className="text-gray-600">Image{images.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Responsive Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((img, index) => (
                <div
                  key={img._id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Image Container */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={`http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    {/* View Button */}
                    <button
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#BB8C4B] hover:bg-[#A67A3D] p-5 rounded-full transform scale-0 group-hover:scale-100 transition-all duration-500 shadow-xl"
                      onClick={() =>
                        setSelectedImage(
                          `http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`
                        )
                      }
                      aria-label="View full image"
                    >
                      <FaEye className="text-white text-2xl" />
                    </button>

                    {/* Image Number */}
                    <div className="text-white/90 text-sm font-medium">
                      Image #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white/90 hover:text-white text-4xl z-50 transition-all hover:rotate-90 duration-300"
            onClick={() => setSelectedImage(null)}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>

          {/* Image Counter/Info */}
          <div className="absolute top-6 left-6 text-white/90 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
            Gallery Image
          </div>

          {/* Full-size Image */}
          <img
            src={selectedImage}
            alt="Full size gallery image"
            className="max-w-[95%] max-h-[90vh] rounded-xl shadow-2xl object-contain transform scale-95 transition-transform duration-500 ease-out"
            onLoad={(e) => e.currentTarget.classList.replace("scale-95", "scale-100")}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerGallery;