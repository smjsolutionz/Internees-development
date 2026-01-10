import React, { useState } from "react";
import { useParams } from "react-router-dom";
import BookingDrawer from "./BookingDrawer";
import about1 from "../assets/images/about1.webp";

const ServiceDetails = () => {
  const { slug } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    {
      title: "Simple Haircut Men",
      slug: "simple-haircut-men",
      image: about1,
      description: "Basic haircut for men. Perfect for a fresh look with minimal styling.",
      duration: "30 min",
      price: 800,
      pricing: [{ title: "Standard", price: 800 }],
    },
    {
      title: "Fade Haircut",
      slug: "fade-haircut",
      image: "/images/fade-haircut.jpg",
      description: "Stylish fade haircut that blends perfectly and gives a modern appearance.",
      duration: "45 min",
      price: 1200,
      pricing: [
        { title: "Standard", price: 1200 },
        { title: "Premium", price: 1500 },
      ],
    },
    {
      title: "Long Cut",
      slug: "long-cut",
      image: "/images/long-cut.jpg",
      description: "Haircut for long hair with layered style and precision trimming.",
      duration: "60 min",
      price: 1500,
      pricing: [
        { title: "Standard", price: 1500 },
        { title: "Premium", price: 1800 },
      ],
    },
    {
      title: "Beard Shave",
      slug: "beard-shave",
      image: "/images/beard-shave.jpg",
      description: "Smooth beard shave for a clean and sharp look.",
      duration: "20 min",
      price: 500,
      pricing: [{ title: "Standard", price: 500 }],
    },
    {
      title: "Beard Trim",
      slug: "beard-trim",
      image: "/images/beard-trim.jpg",
      description: "Neat beard trimming with precise edges and styling.",
      duration: "25 min",
      price: 700,
      pricing: [{ title: "Standard", price: 700 }],
    },
    {
      title: "Shave",
      slug: "shave",
      image: "/images/shave.jpg",
      description: "Clean shave for a smooth and refreshing look.",
      duration: "15 min",
      price: 400,
      pricing: [{ title: "Standard", price: 400 }],
    },
  ];

  const service = services.find((s) => s.slug === slug);

  if (!service)
    return (
      <div className="flex justify-center items-center h-96">
        <h2 className="text-xl text-gray-500">Service not found</h2>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">

      {/* -------- PARALLEL LAYOUT START -------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

        {/* IMAGE SECTION */}
        <div className="w-full flex items-center justify-center md:pr-6">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-auto rounded-xl object-contain"
          />
        </div>

        {/* TEXT SECTION */}
        <div className="space-y-6 md:pl-6">

          <h1 className="text-3xl font-bold text-gray-900">
            {service.title}
          </h1>

          <p className="text-gray-700 leading-relaxed">
            {service.description}
          </p>

          {/* INFO BOXES */}
          <div className="grid grid-cols-2 gap-6">

            <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm border">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
              <p className="text-lg font-semibold mt-1 text-gray-900">{service.duration}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-center shadow-sm border">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
              <p className="text-lg font-semibold mt-1 text-gray-900">₹{service.price}</p>
            </div>

          </div>

          {/* BOOK BUTTON */}
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#C89B4E] hover:bg-[#b88b40] text-white px-10 py-3 rounded-lg font-semibold shadow-md transition-all"
          >
            Book Appointment
          </button>

        </div>

      </div>
      {/* -------- PARALLEL LAYOUT END -------- */}

      {/* Booking Drawer */}
      <BookingDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        service={service.title}
        price={service.price}
      />

    </div>
  );
};

export default ServiceDetails;
