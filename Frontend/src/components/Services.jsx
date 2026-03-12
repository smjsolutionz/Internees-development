import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingDrawer from "./BookingDrawer";
import { FaArrowRight, FaEye } from "react-icons/fa";
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

  return (
    <div className="bg-[#faf8f5] min-h-screen">

      {/* Hero Banner */}
      <div className="relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/261951/pexels-photo-261951.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#222227]/95 via-[#2d2d2d]/90 to-[#BB8C4B]/85"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="inline-block animate-fade-in mb-6">
            <span className="px-4 py-2 bg-[#BB8C4B]/20 border border-[#BB8C4B]/30 rounded-full text-[#BB8C4B] text-sm font-medium tracking-wider backdrop-blur-sm">
              OUR SERVICES
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white drop-shadow-lg animate-fade-in-up">
            Discover Premium Services
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up-delay mt-4 drop-shadow-sm">
            From grooming to styling, we offer top-notch services to elevate your look
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

      {/* Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-20">
            <h1 className="text-3xl sm:text-4xl font-serif text-black">All Services</h1>
            <p className="text-[#BB8C4B] tracking-widest uppercase mb-3">
              Explore all available services
            </p>
          </div>

          {/* Services Grid */}
          {loading ? (
            <p className="text-center mt-10">Loading services...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="relative p-8 text-center border rounded-2xl shadow-lg hover:shadow-2xl transition bg-white"
                >
                  {/* Image container */}
                  <div className="relative mx-auto mb-4 w-64 h-48 sm:w-72 sm:h-52 rounded-xl overflow-hidden group">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000/${service.images[0].replace(/\\/g, "/")}`}
                        alt={service.name}
                        className="w-full h-full object-cover rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:blur-sm"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-6xl text-[#BB8C4B] rounded-xl">
                        💈
                      </div>
                    )}

                    {/* Eye icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/servicedetail/${service._id}`);
                        }}
                        className="pointer-events-auto bg-[#BB8C4B] rounded-full p-2 shadow-lg cursor-pointer 
                          hover:scale-110 transition-transform duration-200"
                      >
                        <FaEye className="text-white text-2xl sm:text-3xl" />
                      </div>
                    </div>
                  </div>

                  {/* Service Name */}
                  <h3 className="text-xl font-serif mb-2">{service.name}</h3>

                  {/* Pricing */}
                  <div className="mt-4">
                    {service.pricing ? <p>Price: {service.pricing}</p> : <p>No pricing available</p>}
                  </div>

                  {/* Book Now Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        setIsOpen(true);
                      }}
                      className="group relative px-8 sm:px-10 py-3 text-xs sm:text-sm tracking-widest text-black 
                        border border-[#D79A4A] transition-all duration-300 hover:bg-[#BB8C4B] hover:text-white 
                        flex items-center justify-center gap-2"
                    >
                      Book Now <FaArrowRight className="inline-block text-xs sm:text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </div>
      </section>

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

export default Services;