import { useParams } from "react-router-dom";
import { packages } from "../data/packages";

const PackageDetail = () => {
  const { id } = useParams();
  const pkg = packages.find((p) => p.id === id && p.active);

  if (!pkg) {
    return (
      <div className="py-20 text-center text-gray-500">
        Package not found.
      </div>
    );
  }

  return (
    <section className="bg-[#faf7f2] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          
          {/* LEFT – IMAGE */}
          <div>
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-105 object-cover rounded-2xl shadow"
            />
          </div>

          {/* RIGHT – CONTENT */}
          <div>
            <h1 className="text-4xl font-serif mb-2">
              {pkg.name}
            </h1>

            <p className="text-gray-600 mb-3">
              Duration: {pkg.duration}
            </p>

            <p className="text-3xl font-bold text-[#c0954d] mb-6">
              {pkg.price}/-
            </p>

            <h3 className="text-xl font-semibold mb-4">
              Included Services
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 mb-8">
              {pkg.services.map((service, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#c0954d]">•</span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>

            <button className="bg-[#c0954d] text-white py-3 px-8 rounded-md font-semibold hover:bg-[#a77e3f] transition">
              Book This Package
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PackageDetail;
