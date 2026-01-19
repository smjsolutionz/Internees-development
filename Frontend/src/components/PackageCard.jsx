import { Link } from "react-router-dom";

const PackageCard = ({ pkg }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-xl transition">
      <img
        src={pkg.image}
        alt={pkg.name}
        className="rounded-xl h-40 w-full object-cover mb-4"
      />

      <h3 className="text-xl font-serif uppercase">{pkg.name}</h3>
      <p className="text-sm text-gray-500">{pkg.duration}</p>

      <p className="text-2xl font-bold text-[#c0954d] mt-2">
        {pkg.price}/-
      </p>

      <Link
        to={`/packages/${pkg.id}`}
        className="mt-auto bg-[#c0954d] text-white py-3 rounded-md text-center font-semibold hover:bg-[#a77e3f]"
      >
        View Details
      </Link>
    </div>
  );
};

export default PackageCard;
