import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/customer/team`);
        setTeamMembers(data || []);
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };
    fetchTeam();
  }, []);

  // card width based on breakpoint (keeps design same)
  const getCardWidth = () => {
    if (window.innerWidth < 640) return 260; // mobile
    if (window.innerWidth < 1024) return 280; // tablet
    if (window.innerWidth < 1280) return 300; // desktop
    return 320; // xl
  };

  const scrollByCard = (dir = 1) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir * getCardWidth(),
      behavior: "smooth",
    });
  };

  return (
    <section className=" mt-20 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="h-0.5 sm:h-1 w-8 sm:w-10 lg:w-12 bg-[#BB8C4B]" />
            <span className="text-[#BB8C4B] font-semibold tracking-wider uppercase text-xs sm:text-sm">
              Best Salon
            </span>
            <div className="h-0.5 sm:h-1 w-8 sm:w-10 lg:w-12 bg-[#BB8C4B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#222227] mb-3 sm:mb-4">
            Meet Our <span className="text-[#BB8C4B]">Team</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Our talented team of professionals is dedicated to providing you with
            exceptional service and stunning results.
          </p>
        </div>

        {/* Slider (one slider for all screens) */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scrollByCard(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-[#BB8C4B] shadow-lg flex items-center justify-center hover:bg-[#a87a40] text-white transition"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollByCard(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-[#BB8C4B] shadow-lg flex items-center justify-center hover:bg-[#a87a40] text-white transition"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 lg:gap-7 overflow-x-auto scroll-smooth scrollbar-hide px-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[300px] xl:w-[320px] transition-transform duration-300 hover:-translate-y-2"
              >
                <TeamCard member={member} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }) {
  return (
    <div className="group relative overflow-hidden rounded-xl lg:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={`${API_URL}/uploads/${member.profileImage}`}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=BB8C4B&color=fff&size=300`;
          }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 lg:p-5">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{member.name}</h3>
        <p className="text-[#BB8C4B] text-xs sm:text-sm tracking-wider uppercase font-medium">
          {member.specialty || member.position || "Specialist"}
        </p>
      </div>
    </div>
  );
}
