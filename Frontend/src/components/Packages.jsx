import React, { useRef } from "react";

const PackageCard = ({ title, days, price, servicesLeft, servicesRight }) => {
  return (
    <div
      className="
        min-w-[320px] sm:min-w-95 lg:min-w-105
        bg-white rounded-2xl shadow-lg p-6
        flex flex-col snap-center
        hover:shadow-2xl transition-all duration-300
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-serif uppercase tracking-wide">
          {title}
          <span className="block text-sm normal-case text-gray-500 mt-1">
            ({days})
          </span>
        </h3>

        <span className="text-2xl font-bold text-[#c0954d]">
          {price}/-
        </span>
      </div>

      {/* Services */}
      <div
        className="
          grid grid-cols-2 gap-4
          text-sm text-gray-600
          max-h-65 overflow-y-auto pr-2
          scrollbar-thin scrollbar-thumb-[#c0954d] scrollbar-track-transparent
        "
      >
        <ul className="space-y-2 list-disc list-inside">
          {servicesLeft.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <ul className="space-y-2 list-disc list-inside">
          {servicesRight.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <button
        className="
          mt-6 bg-[#c0954d] text-white py-3 rounded-md font-semibold
          hover:bg-[#a77e3f] transition-all duration-300
          hover:scale-105 active:scale-95
        "
      >
        BOOK NOW
      </button>
    </div>
  );
};

const Packages = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -380, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 380, behavior: "smooth" });
  };

  return (
    <section className="bg-[#faf7f2] mt-10 py-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">
          Our Premium Packages
        </h2>

        {/* IMPORTANT FIX HERE */}
        <div className="relative overflow-x-hidden">

          {/* LEFT BUTTON */}
          <button
            onClick={scrollLeft}
            className="
              absolute left-0 top-1/2 -translate-y-1/2
              bg-white w-10 h-10 rounded-full shadow
              flex items-center justify-center text-2xl z-10
              hover:bg-[#c0954d] hover:text-white transition
            "
          >
            ‹
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={scrollRight}
            className="
              absolute right-0 top-1/2 -translate-y-1/2
              bg-white w-10 h-10 rounded-full shadow
              flex items-center justify-center text-2xl z-10
              hover:bg-[#c0954d] hover:text-white transition
            "
          >
            ›
          </button>

          {/* SCROLL CONTAINER */}
          <div
            ref={scrollRef}
            className="
              flex gap-8 overflow-x-auto pb-6
     snap-x snap-mandatory
     overscroll-x-contain
     scrollbar-hide
            "
          >
            <PackageCard
              title="Gold Package"
              days="2 Days"
              price="20000"
              servicesLeft={[
                "Hair Cut (800 - 1500)",
                "Neck Polish",
                "Pedicure Simple",
                "Makeover",
                "Shower & Refresh",
                "Hand Polish",
                "Even Skin Tone",
              ]}
              servicesRight={[
                "Shave / Beard",
                "Manicure",
                "Styling",
                "Cleansing",
                "Foot Polish",
                "Diamond Face Wash",
              ]}
            />

            <PackageCard
              title="Platinum Package"
              days="3 Days"
              price="25000"
              servicesLeft={[
                "Hair Cut",
                "Signature Pedicure",
                "Manicure",
                "Cleansing (Dry Skin)",
                "Foot Polish",
                "Head & Shoulder Massage",
              ]}
              servicesRight={[
                "Shave / Beard",
                "Even Skin Tone (Mask)",
                "Shower & Refresh",
                "Hand Polish",
                "Styling",
              ]}
            />

            <PackageCard
              title="Diamond Package"
              days="4 Days"
              price="35000"
              servicesLeft={[
                "Hair Cut",
                "Signature Manicure",
                "Skin Brightening",
                "Shower & Refresh",
                "Styling",
                "Foot Polish",
                "Head & Shoulder Massage",
              ]}
              servicesRight={[
                "Shave / Beard",
                "Signature Pedicure",
                "Rejex Rejuv",
                "Cleansing",
                "Hand Polish",
                "Makeover",
                "Foot Massage",
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Packages;
