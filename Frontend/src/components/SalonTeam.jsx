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

  const scrollByCard = (dir = 1) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstChild?.offsetWidth || 240;
    scrollRef.current.scrollBy({
      left: dir * (cardWidth + 20),
      behavior: "smooth",
    });
  };

  // AUTO SCROLL
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      const cardWidth = slider.firstChild?.offsetWidth || 240;
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: cardWidth + 20, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [teamMembers]);

  return (
    <section className=" py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[2px] w-10 bg-[#BB8C4B]" />
            <span className="text-[#BB8C4B] font-semibold tracking-widest uppercase text-sm">
              Best Salon
            </span>
            <div className="h-[2px] w-10 bg-[#BB8C4B]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#222227] mb-3">
            Meet Our <span className="text-[#BB8C4B]">Team</span>
          </h2>

          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Our talented team of professionals is dedicated to providing you
            with exceptional service and stunning results.
          </p>
        </div>

        {/* Slider */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            onClick={() => scrollByCard(-1)}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg  flex items-center justify-center hover:bg-[#BB8C4B] hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollByCard(1)}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg  flex items-center justify-center hover:bg-[#BB8C4B] hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-6"
          >
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start"
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
    <div className="relative w-[220px] sm:w-[240px] rounded-2xl overflow-hidden transition-all duration-500">

      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={`${API_URL}/uploads/${member.profileImage}`}
          alt={member.name}
          className="w-full h-[300px] object-cover object-center"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              member.name
            )}&background=BB8C4B&color=fff&size=300`;
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl"></div>
      </div>

      {/* Info Card */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-center py-3 shadow-lg">

          {/* Name */}
          <h3 className="text-white text-base font-semibold tracking-wide">
            {member.name}
          </h3>

          {/* Specialization */}
          <p className="text-[#BB8C4B] text-xs uppercase tracking-widest mt-1">
            {member.specialty || member.position || "Specialist"}
          </p>

        </div>
      </div>

      {/* Hover Glow Border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#BB8C4B] group-hover:shadow-[0_0_25px_rgba(187,140,75,0.5)] transition duration-500"></div>
    </div>
  );
}