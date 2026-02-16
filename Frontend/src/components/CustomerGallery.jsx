import React, { useEffect, useState } from "react";
import { FaEye, FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaImages } from "react-icons/fa";

const CustomerGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const openModal = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(
      `http://localhost:5000/${images[newIndex].image_url.replace(/\\/g, "/")}`
    );
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(
      `http://localhost:5000/${images[newIndex].image_url.replace(/\\/g, "/")}`
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentIndex]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
        <div className="relative">
          <div className="animate-spin h-20 w-20 border-4 border-[#BB8C4B] border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 animate-ping h-20 w-20 border-4 border-[#BB8C4B] border-t-transparent rounded-full opacity-20"></div>
        </div>
        <p className="mt-6 text-gray-600 font-semibold text-lg">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">
      {/* Hero Section with Modern Salon Background */}
      <div className="relative h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3992873/pexels-photo-3992873.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern Salon Interior"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/70"></div>
        </div>

        {/* Animated Particles/Dots Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-[#BB8C4B] rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-[#D79A4A] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-[#BB8C4B] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-[#D79A4A] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          {/* Badge */}
          <div className="mb-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full shadow-lg">
              <FaImages className="text-[#BB8C4B]" />
              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                Our Portfolio
              </span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight leading-tight animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Gallery
            <span className="block mt-2 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] bg-clip-text text-transparent">
              Showcase
            </span>
          </h1>

          {/* Decorative Line */}
          <div className="flex items-center gap-3 mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#BB8C4B]"></div>
            <div className="w-3 h-3 bg-[#BB8C4B] rounded-full"></div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#BB8C4B]"></div>
          </div>

          {/* Subtitle */}
          <p className="text-gray-200 text-lg md:text-xl lg:text-2xl max-w-3xl leading-relaxed font-light animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Discover our finest work and transformations. Every image tells a story of elegance and expertise.
          </p>
          
          {/* Stats */}
          {images.length > 0 && (
            <div className="mt-8 flex gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-white">{images.length}+</div>
                <div className="text-white/80 text-sm">Stunning Photos</div>
              </div>
            </div>
          )}

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 animate-bounce">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white/60 text-xs uppercase tracking-wider">Scroll Down</span>
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

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg viewBox="0 0 1440 100" className="w-full h-auto" preserveAspectRatio="none">
            <path
              fill="rgb(249, 250, 251)"
              d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,56C672,48,768,32,864,32C960,32,1056,48,1152,53.3C1248,59,1344,53,1392,50.7L1440,48L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-20 px-4 max-w-7xl mx-auto">
        {images.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-xl">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                <svg 
                  className="w-16 h-16 text-gray-400" 
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
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">Gallery Coming Soon</h3>
            <p className="text-gray-500 text-lg">We're preparing stunning visuals for you. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] bg-clip-text text-transparent text-sm font-bold uppercase tracking-wider">
                  Featured Work
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                Our Collection
              </h2>
              <div className="flex justify-center mt-4 mb-6">
                <div className="h-1 w-24 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] rounded-full"></div>
              </div>
              
              {/* Gallery Stats */}
              <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg border border-gray-200 mt-6">
                <div className="w-2 h-2 bg-[#BB8C4B] rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-semibold">
                  Showcasing <span className="text-[#BB8C4B] text-xl">{images.length}</span> stunning image{images.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Responsive Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((img, index) => (
                <div
                  key={img._id}
                  className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-white animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={`http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <button
                        onClick={() =>
                          openModal(
                            `http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`,
                            index
                          )
                        }
                        className="bg-white hover:bg-[#BB8C4B] text-[#BB8C4B] hover:text-white p-5 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 group/btn"
                        aria-label="View full image"
                      >
                        <FaExpand className="text-2xl" />
                      </button>
                      <p className="text-white font-semibold mt-4 text-sm tracking-wide">
                        Click to enlarge
                      </p>
                    </div>

                    {/* Image Number Badge */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold border border-white/20">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Bottom Info Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="text-sm font-semibold">Gallery Image</p>
                        <p className="text-xs text-white/70">Professional Work</p>
                      </div>
                      <FaEye className="text-[#BB8C4B] text-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white text-4xl z-50 hover:text-[#BB8C4B] transition-all duration-300 hover:rotate-90 bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/20"
            onClick={closeModal}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:text-[#BB8C4B] transition-all duration-300 bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>
              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-4xl z-50 hover:text-[#BB8C4B] transition-all duration-300 bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold text-lg z-50 border border-white/30">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Full-size Image */}
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt={`Gallery image ${currentIndex + 1}`}
              className="w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain animate-scaleIn"
            />

            {/* Image Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-xl">Gallery Image #{currentIndex + 1}</p>
                  <p className="text-white/70 text-sm">Professional Photography</p>
                </div>
                <div className="bg-[#BB8C4B] px-4 py-2 rounded-full">
                  <span className="text-white font-semibold text-sm">Featured</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl max-w-md overflow-x-auto border border-white/20">
              {images.slice(Math.max(0, currentIndex - 2), Math.min(images.length, currentIndex + 3)).map((img, idx) => {
                const actualIndex = Math.max(0, currentIndex - 2) + idx;
                return (
                  <button
                    key={img._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(
                        `http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`,
                        actualIndex
                      );
                    }}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 flex-shrink-0 ${
                      actualIndex === currentIndex
                        ? "border-[#BB8C4B] scale-110 shadow-xl"
                        : "border-white/40 hover:border-white/70 hover:scale-105"
                    }`}
                  >
                    <img
                      src={`http://localhost:5000/${img.image_url.replace(/\\/g, "/")}`}
                      alt={`Thumbnail ${actualIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Keyboard Hints */}
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-white/60 text-sm hidden md:flex gap-8">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-white/10 rounded border border-white/20">←</kbd>
              <span>Previous</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-white/10 rounded border border-white/20">ESC</kbd>
              <span>Close</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-white/10 rounded border border-white/20">→</kbd>
              <span>Next</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default CustomerGallery;