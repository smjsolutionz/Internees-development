import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {motion,  AnimatePresence } from "framer-motion";

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const autoScrollRef = useRef(null);

  const fetchFeaturedReviews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/customer/reviews/featured`
      );
      const fetchedReviews = Array.isArray(res.data.reviews)
        ? res.data.reviews
        : [];
      setReviews(fetchedReviews);
    } catch (err) {
      console.error("❌ Failed to fetch featured reviews:", err);
      // Sample data fallback
      setReviews([
        {
          _id: "1",
          message: "Excellent service! The team was professional and delivered beyond expectations.",
          rating: 5,
          CUSTOMER: { name: "Alex Johnson", profession: "Marketing Director", avatar: "" },
        },
        {
          _id: "2",
          message: "Outstanding work quality and attention to detail. Will definitely work with them again.",
          rating: 5,
          CUSTOMER: { name: "Sarah Williams", profession: "Business Owner", avatar: "" },
        },
        {
          _id: "3",
          message: "Professional, timely, and exceeded all our expectations. Great communication throughout.",
          rating: 4,
          CUSTOMER: { name: "Michael Chen", profession: "Product Manager", avatar: "" },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeaturedReviews(); }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      autoScrollRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reviews.length);
        scrollToIndex((activeIndex + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(autoScrollRef.current);
    }
  }, [reviews.length, activeIndex]);

  const scrollLeft = () => {
    clearInterval(autoScrollRef.current);
    const newIndex = activeIndex === 0 ? reviews.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    clearInterval(autoScrollRef.current);
    const newIndex = activeIndex === reviews.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const scrollToIndex = (index) => {
    if (sliderRef.current) {
      const cardWidth = 384; 
      sliderRef.current.scrollTo({
        left: index * (cardWidth + 24),
        behavior: "smooth"
      });
    }
  };

  const getAvatar = (customer) => {
    if (customer?.avatar) return customer.avatar;
    const name = customer?.name || "Anonymous";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=BB8C4B&color=ffffff&size=128&bold=true&font-size=0.5`;
  };

  if (loading) {
    return (
      <div className="py-28 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BB8C4B] mb-4"></div>
          <div className="text-lg text-gray-600 font-medium">Loading testimonials...</div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-28 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No testimonials yet</h3>
          <p className="text-gray-500">Be the first to share your experience!</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24  mt-20 bg-[#faf7f2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#BB8C4B] rounded-full mb-4"
          >
            <span className="text-white font-medium text-sm uppercase tracking-wider flex items-center">
              <FaStar className="mr-2 text-yellow-400" />
              Client Testimonials
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            What Our <span className="text-[#BB8C4B]">Clients Say</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Here's what our clients have to say about their experience working with us.
          </motion.p>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Navigation */}
          <div className="absolute -top-16 right-0 flex space-x-3 z-20">
            <button onClick={scrollLeft} className="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200">
              <FaChevronLeft className="text-gray-700 text-lg" />
            </button>
            <button onClick={scrollRight} className="flex items-center justify-center h-12 w-12 rounded-full bg-[#BB8C4B] shadow-lg hover:bg-[#A87742] active:scale-95 transition-all duration-200">
              <FaChevronRight className="text-white text-lg" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { clearInterval(autoScrollRef.current); setActiveIndex(index); scrollToIndex(index); }}
                  className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "w-8 bg-[#BB8C4B]" : "w-2 bg-gray-300 hover:bg-gray-400"}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Cards */}
          <div ref={sliderRef} className="flex overflow-x-auto scroll-smooth space-x-6 pb-10 px-2 scrollbar-hide" style={{ scrollSnapType: "x mandatory" }}>
            <AnimatePresence>
              {reviews.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-shrink-0 w-80 md:w-96 scroll-snap-align-start"
                >
                  <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full overflow-hidden border border-gray-100">
                    <div className="h-2 bg-[#BB8C4B]"></div>
                    <div className="p-8">
                      <div className="flex justify-center mb-6">
                        <div className="p-4 bg-[#FFF6E5] rounded-2xl inline-flex">
                          <FaQuoteLeft className="text-3xl text-[#BB8C4B]" />
                        </div>
                      </div>

                      <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-xl ${i < item.rating ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>

                      <p className="text-gray-700 text-center mb-8 leading-relaxed text-lg italic">"{item.message}"</p>

                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img src={getAvatar(item.CUSTOMER)} alt={item.CUSTOMER?.name || "Anonymous"} className="w-14 h-14 object-cover rounded-full border-4 border-white shadow-md" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900">{item.CUSTOMER?.name || "Anonymous"}</h4>
                            <p className="text-gray-600 text-sm">{item.CUSTOMER?.profession || "Client"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
