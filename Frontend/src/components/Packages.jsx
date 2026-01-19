import { useState } from "react";
import PackageCard from "../components/PackageCard";
import { packages } from "../data/packages";

const Packages = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredPackages = packages
    .filter((pkg) => pkg.active)
    .filter((pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((pkg) =>
      category === "All" ? true : pkg.category === category
    );

  return (
    <section className="bg-[#faf7f2] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-serif text-center mb-10">
          Our Premium Packages
        </h2>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="Search packages..."
            className="p-3 rounded-md border w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-3 rounded-md border"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            <option>Basic</option>
            <option>Premium</option>
            <option>Luxury</option>
          </select>
        </div>

        {/* Packages */}
        {filteredPackages.length === 0 ? (
          <p className="text-center text-gray-500">
            No packages available at the moment.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Packages;
