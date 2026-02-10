import { Link } from "react-router-dom";
import { FaClock, FaCheck } from "react-icons/fa";

const PackageCard = ({ pkg }) => {
  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-amber-100 hover:border-[#BB8C4B]/50 transition-all duration-500 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
      
      {/* Top Section - Image */}
      <div className="relative overflow-hidden h-64">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10"></div>
        
        <img
          src={`http://localhost:5000/${pkg.image}`}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Package Name Overlay */}
        <div className="absolute top-6 left-6 right-6 z-20">
          <h3 className="text-2xl md:text-3xl font-serif text-white drop-shadow-2xl leading-tight">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 bg-gradient-to-br from-white to-amber-50/30">
        
        {/* Duration & Price Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Duration */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <FaClock className="text-[#BB8C4B] text-xs" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Duration</p>
            </div>
            <p className="text-base font-bold text-gray-800 ml-10">{pkg.totalDuration}</p>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-br from-[#BB8C4B] to-[#D4A25C] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-white/80 uppercase tracking-wider font-medium mb-2">Price</p>
            <p className="text-2xl font-bold text-white">
              RS{pkg.price}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent mb-5"></div>

        {/* Features */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <FaCheck className="text-green-600 text-xs" />
            </div>
            <span>Professional Service</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <FaCheck className="text-green-600 text-xs" />
            </div>
            <span>Premium Products</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <FaCheck className="text-green-600 text-xs" />
            </div>
            <span>Expert Stylists</span>
          </div>
        </div>

        {/* Button */}
        <Link
          to={`/packages/${pkg._id}`}
          className="block w-full text-center py-3.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-[#BB8C4B] transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
        >
          Explore Package
        </Link>
      </div>
    </div>
  );
};

export default PackageCard;