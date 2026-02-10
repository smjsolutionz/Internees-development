import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingDrawer from "./BookingDrawer";
import { FaArrowRight, FaEye, FaCut, FaSpa } from "react-icons/fa";
import axios from "axios";

const ServicesSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/customer/services`
        );
        if (response.data.success) {
          setServices(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
        <div className="relative">
          <div className="animate-spin h-16 w-16 border-4 border-[#BB8C4B] border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-[#BB8C4B] border-t-transparent rounded-full opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Hero Section with Background */}
      <div className="relative h-[450px] md:h-[550px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          {/* Decorative Icons */}
          <div className="flex gap-8 mb-6 opacity-80">
            <FaCut className="text-[#BB8C4B] text-3xl md:text-4xl animate-pulse" />
            <FaSpa className="text-[#BB8C4B] text-3xl md:text-4xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <p className="text-[#BB8C4B] tracking-[0.3em] uppercase mb-4 text-sm md:text-base font-light">
            Our Services
          </p>
          
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-tight leading-tight">
            Premium Salon <br className="hidden sm:block" />
            Services
          </h1>
          
          <div className="w-32 h-1 bg-[#BB8C4B] mb-6"></div>
          
          <p className="text-gray-200 text-lg md:text-xl max-w-3xl leading-relaxed font-light">
            Experience luxury and elegance with our expertly crafted salon services, 
            tailored to bring out your unique beauty
          </p>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 animate-bounce">
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

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md mb-6">
            <span className="text-[#BB8C4B] font-bold text-lg">{services.length}</span>
            <span className="text-gray-600">Service{services.length !== 1 ? "s" : ""} Available</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
            Explore Our Signature Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From classic cuts to modern transformations, discover services designed to elevate your style
          </p>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-6">
              <FaCut className="w-24 h-24 mx-auto text-gray-300" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Services Available</h3>
            <p className="text-gray-500">Check back soon for our latest offerings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, index) => (
              <div
                key={service._id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/${service.images[0].replace(/\\/g, "/")}`}
                      alt={service.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                      <FaCut className="text-[#BB8C4B] text-6xl opacity-50" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* View Details Icon */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/servicedetail/${service._id}`);
                    }}
                  >
                    <div className="bg-[#BB8C4B] hover:bg-[#A67A3D] rounded-full p-4 shadow-2xl cursor-pointer transform scale-0 group-hover:scale-100 transition-all duration-500">
                      <FaEye className="text-white text-2xl" />
                    </div>
                  </div>

                  {/* Price Badge */}
                  {service.pricing && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <span className="text-[#BB8C4B] font-bold text-lg">{service.pricing}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Service Name */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-[#BB8C4B] transition-colors duration-300">
                    {service.name}
                  </h3>

                  {/* Book Now Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(service);
                      setIsOpen(true);
                    }}
                    className="w-full group/btn relative overflow-hidden px-8 py-3.5 text-sm tracking-widest font-medium text-gray-900 border-2 border-[#BB8C4B] rounded-lg transition-all duration-300 hover:text-white flex items-center justify-center gap-2"
                  >
                    <span className="absolute inset-0 bg-[#BB8C4B] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></span>
                    <span className="relative z-10">BOOK NOW</span>
                    <FaArrowRight className="relative z-10 text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#BB8C4B]/10 to-transparent rounded-br-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* View All Services Button */}
        {services.length > 6 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => navigate("/services")}
              className="group relative overflow-hidden px-12 py-4 bg-[#BB8C4B] text-white text-sm tracking-widest font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#A67A3D] to-[#BB8C4B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <span className="relative z-10 flex items-center gap-2">
                VIEW ALL SERVICES
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Booking Drawer Popup */}
      {selectedService && (
        <BookingDrawer
          isOpen={isOpen}
          onClose={onClose}
          service={selectedService.name}
          price={selectedService.pricing || "0"}
        />
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
    </section>
  );
};

export default ServicesSection;