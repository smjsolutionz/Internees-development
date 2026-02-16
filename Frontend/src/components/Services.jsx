import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingDrawer from "./BookingDrawer";
import { FaArrowRight, FaEye, FaClock, FaDollarSign, FaStar } from "react-icons/fa";
import axios from "axios";

const Services = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/customer/services`
        );
        if (response.data.success) {
          setServices(response.data.data);
        } else {
          console.error("Failed:", response.data.message);
        }
      } catch (error) {
        console.error("Axios error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BB8C4B] border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-[#BB8C4B] border-t-transparent opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Salon Image */}
      <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Image from Pexels */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3992876/pexels-photo-3992876.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern Hair Salon"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] px-6 py-2 rounded-full text-white text-sm font-semibold uppercase tracking-wider shadow-lg">
                Premium Services
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Discover Our
              <span className="block bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] bg-clip-text text-transparent">
                Exclusive Services
              </span>
            </h1>
            <p className="text-white/90 text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Experience luxury and professionalism with our comprehensive range of beauty and grooming services
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                <p className="text-white font-semibold">{services.length}+ Services Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#F9FAFB"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] bg-clip-text text-transparent text-sm font-bold uppercase tracking-wider">
                What We Offer
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Our Services
            </h2>
            <div className="flex justify-center mt-4">
              <div className="h-1 w-24 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] rounded-full"></div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service._id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/${service.images[0].replace(/\\/g, "/")}`}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                      <span className="text-8xl">💈</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* View Details Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/servicedetail/${service._id}`);
                      }}
                      className="bg-white hover:bg-[#BB8C4B] text-[#BB8C4B] hover:text-white p-4 rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 group/btn"
                    >
                      <FaEye className="text-2xl" />
                    </button>
                  </div>

                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <FaStar size={12} />
                    Popular
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Service Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#BB8C4B] transition-colors duration-300">
                    {service.name}
                  </h3>

                  {/* Service Description (if available) */}
                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Service Details */}
                  <div className="space-y-3 mb-6">
                    {/* Pricing */}
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaDollarSign className="text-[#BB8C4B]" size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Price</p>
                        <p className="font-bold text-gray-900">
                          {service.pricing || "Contact for pricing"}
                        </p>
                      </div>
                    </div>

                    {/* Duration (if available) */}
                    {service.duration && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FaClock className="text-blue-600" size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Duration</p>
                          <p className="font-semibold text-gray-900">{service.duration}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(service);
                      setIsOpen(true);
                    }}
                    className="w-full group/btn relative px-6 py-3 bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Book Now
                      <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D79A4A] to-[#BB8C4B] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-20 h-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#BB8C4B]/10 to-transparent rounded-br-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {services.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6">💈</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Services Available</h3>
              <p className="text-gray-600">Check back soon for our amazing services!</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-[#BB8C4B] to-[#D79A4A] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Book your appointment today and experience the luxury you deserve
          </p>
          <button className="bg-white text-[#BB8C4B] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 shadow-xl">
            Contact Us Now
          </button>
        </div>
      </section>

      {/* Booking Drawer Popup */}
      {selectedService && (
        <BookingDrawer
          isOpen={isOpen}
          onClose={onClose}
          service={selectedService.name}
          price={selectedService.pricing || "0"}
          serviceId={selectedService._id}
        />
      )}

      {/* Custom Animations */}
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

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Services;