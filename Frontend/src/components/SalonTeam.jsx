import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
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

  // Update arrow visibility based on scroll position
  const updateArrows = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", updateArrows);
      updateArrows(); // Initial check
      
      // Recheck on window resize
      const handleResize = () => updateArrows();
      window.addEventListener("resize", handleResize);
      
      return () => {
        scrollEl.removeEventListener("scroll", updateArrows);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [teamMembers]);

  // Scroll by one full viewport
  const scrollByPage = (dir = 1) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: dir * containerWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-16 md:mt-20 py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#faf7f2] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14 lg:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[2px] w-12 md:w-16 bg-[#BB8C4B]" />
            <span className="text-[#BB8C4B] font-semibold tracking-[0.2em] uppercase text-xs md:text-sm">
              Best Salon
            </span>
            <div className="h-[2px] w-12 md:w-16 bg-[#BB8C4B]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#222227] mb-4 leading-tight">
            Meet Our <span className="text-[#BB8C4B]">Team</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
            Our talented team of professionals is dedicated to providing you with
            exceptional service and stunning results.
          </p>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scrollByPage(-1)}
              className="
                absolute left-0 md:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
                rounded-full bg-[#BB8C4B] shadow-xl
                flex items-center justify-center
                hover:bg-[#a87a40] hover:scale-110
                text-white transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#BB8C4B] focus:ring-offset-2
              "
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scrollByPage(1)}
              className="
                absolute right-0 md:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
                rounded-full bg-[#BB8C4B] shadow-xl
                flex items-center justify-center
                hover:bg-[#a87a40] hover:scale-110
                text-white transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#BB8C4B] focus:ring-offset-2
              "
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Cards Container - GRID LAYOUT */}
          <div
            ref={scrollRef}
            className="
              grid 
              grid-cols-1 
              md:grid-cols-4
              gap-6 md:gap-5 lg:gap-6
              overflow-x-auto 
              scroll-smooth
              px-2 md:px-4
              pb-4
              scrollbar-hide
            "
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              gridAutoFlow: "column",
              gridAutoColumns: "100%",
            }}
          >
            {teamMembers.length > 0 ? (
              teamMembers.map((member, index) => (
                <div
                  key={member._id || index}
                  className="w-full md:col-span-1"
                >
                  <TeamCard member={member} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">Loading team members...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile: 1 column scroll */
        @media (max-width: 767px) {
          .scrollbar-hide {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 100%;
          }
        }
        
        /* Tablet & Desktop: 4 columns scroll */
        @media (min-width: 768px) {
          .scrollbar-hide {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: calc(25% - 15px);
          }
        }
      `}</style>
    </section>
  );
}

function TeamCard({ member }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="
      group relative overflow-hidden
      rounded-xl lg:rounded-2xl
      shadow-lg hover:shadow-2xl
      transition-all duration-500
      transform hover:-translate-y-3 hover:scale-[1.02]
      bg-white
      h-full
    ">
      {/* Image Container */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-200">
        <img
          src={
            imageError
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=BB8C4B&color=fff&size=400`
              : `${API_URL}/uploads/${member.profileImage}`
          }
          alt={member.name}
          className="
            w-full h-full object-cover
            group-hover:scale-110 group-hover:rotate-2
            transition-transform duration-700 ease-out
          "
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="
        absolute inset-0
        bg-gradient-to-t from-black/95 via-black/60 to-transparent
        opacity-80 group-hover:opacity-90
        transition-opacity duration-500
      " />

      {/* Content */}
      <div className="
        absolute inset-x-0 bottom-0
        p-5 lg:p-6
        transform translate-y-2 group-hover:translate-y-0
        transition-transform duration-500
      ">
        <h3 className="
          text-xl md:text-2xl font-bold text-white mb-2
          transform translate-y-0 group-hover:-translate-y-1
          transition-transform duration-500
        ">
          {member.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-[2px] w-8 bg-[#BB8C4B]" />
          <p className="
            text-[#BB8C4B] text-xs md:text-sm
            tracking-[0.15em] uppercase font-semibold
          ">
            {member.specialty || member.position || "Specialist"}
          </p>
        </div>

        {/* Social Links */}
        <div className="
          flex gap-3 opacity-0 group-hover:opacity-100
          transform translate-y-4 group-hover:translate-y-0
          transition-all duration-500 delay-100
        ">
          <button className="
            w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm
            flex items-center justify-center
            hover:bg-[#BB8C4B] transition-colors duration-300
            text-white
          " aria-label="Facebook">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button className="
            w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm
            flex items-center justify-center
            hover:bg-[#BB8C4B] transition-colors duration-300
            text-white
          " aria-label="Instagram">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="
        absolute top-4 right-4
        w-12 h-12 border-t-2 border-r-2 border-[#BB8C4B]
        opacity-0 group-hover:opacity-100
        transform scale-75 group-hover:scale-100
        transition-all duration-500
      " />
    </div>
  );
}
