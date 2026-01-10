import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingDrawer from "./BookingDrawer";

import { FaCut, FaUserAlt, FaArrowRight } from "react-icons/fa";
import { GiRazor, GiBeard, GiHairStrands } from "react-icons/gi";
import { MdOutlineContentCut } from "react-icons/md";

const Services = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const onClose = () => setIsOpen(false);

  const services = [
    {
      title: "Simple Haircut Men",
      slug: "simple-haircut-men",
      price: 800,
      pricing: [{ title: "Standard", price: 800 }],
      icon: FaCut,
    },
    {
      title: "Fade Haircut",
      slug: "fade-haircut",
      price: 1200,
      pricing: [
        { title: "Standard", price: 1200 },
        { title: "Premium", price: 1500 },
      ],
      icon: FaUserAlt,
    },
    {
      title: "Long Cut",
      slug: "long-cut",
      price: 1500,
      pricing: [
        { title: "Standard", price: 1500 },
        { title: "Premium", price: 1800 },
      ],
      icon: GiHairStrands,
    },
    {
      title: "Beard Shave",
      slug: "beard-shave",
      price: 500,
      pricing: [{ title: "Standard", price: 500 }],
      icon: GiRazor,
    },
    {
      title: "Beard Trim",
      slug: "beard-trim",
      price: 700,
      pricing: [{ title: "Standard", price: 700 }],
      icon: GiBeard,
    },
    {
      title: "Shave",
      slug: "shave",
      price: 400,
      pricing: [{ title: "Standard", price: 400 }],
      icon: MdOutlineContentCut,
    },
  ];

  return (
    <section className="bg-gray-100 py-24 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-3xl sm:text-4xl font-serif text-black">All Services</h1>
          <p className="text-[#BB8C4B] tracking-widest uppercase mb-3">Explore all available services</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="p-8 text-center border rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-white"
                onClick={() => navigate(`/servicedetail/${service.slug}`)}
              >
                <Icon className="mx-auto text-4xl text-[#BB8C4B] mb-4" />
                <h3 className="text-xl font-serif">{service.title}</h3>

                <div className="mt-4">
                  {service.pricing.map((p, i) => (
                    <p key={i}>{p.title}: ₹{p.price}</p>
                  ))}

                  {/* BOOK NOW BUTTON */}
                  <div className="mt-4 flex justify-center">
 <button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedService(service);
    setIsOpen(true);
  }}
  className="group relative px-8 sm:px-10 py-3 text-xs sm:text-sm tracking-widest text-black border border-[#D79A4A] transition-all duration-300 hover:bg-[#BB8C4B] hover:text-white flex items-center justify-center gap-2"
>
  Book Now <FaArrowRight className="inline-block text-xs sm:text-sm" />
  <span className="absolute -top-2 -left-2 w-7 h-3 border-t border-l border-[#D79A4A] group-hover:w-10 transition-all duration-300" />
  <span className="absolute -top-2 -right-2 w-7 h-3 border-t border-r border-[#D79A4A] group-hover:w-10 transition-all duration-300" />
  <span className="absolute -bottom-2 -left-2 w-7 h-3 border-b border-l border-[#D79A4A] group-hover:w-10 transition-all duration-300" />
  <span className="absolute -bottom-2 -right-2 w-7 h-3 border-b border-r border-[#D79A4A] group-hover:w-10 transition-all duration-300" />
</button>
</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOOKING DRAWER POPUP */}
      {selectedService && (
        <BookingDrawer
          isOpen={isOpen}
          onClose={onClose}
          service={selectedService.title}
          price={selectedService.price}
        />
      )}
    </section>
  );
};

export default Services;
