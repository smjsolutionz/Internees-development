import { useEffect, useRef, useState } from "react";
import axios from "axios";
import PackageCard from "../components/PackageCard";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  // FETCH PACKAGES
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/packages/customer"
        );

        const activePackages = res.data.filter((pkg) => pkg.isActive);
        setPackages(activePackages);
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredPackages = packages
    .filter((pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((pkg) =>
      category === "All" ? true : pkg.category === category
    );

  // SMART SCROLL
  const scrollByCard = (dir = 1) => {
    if (!scrollRef.current) return;

    const cardWidth =
      scrollRef.current.firstChild?.offsetWidth || 380;

    scrollRef.current.scrollBy({
      left: dir * (cardWidth + 32),
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading packages...
      </div>
    );
  }

  return (
    <section id="packages" className="mt-20">
      <div className="max-w-7xl mx-auto px-4 relative">

        <h2 className="text-4xl font-serif text-center mb-10">
          Our Premium Packages
        </h2>

        {/* LEFT BUTTON */}
        <button
          onClick={() => scrollByCard(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 flex items-center justify-center
          bg-white shadow-lg rounded-full hover:bg-[#c0954d] hover:text-white transition"
        >
          ❮
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scrollByCard(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-10 h-10 flex items-center justify-center
          bg-white shadow-lg rounded-full hover:bg-[#c0954d] hover:text-white transition"
        >
          ❯
        </button>

        {/* HORIZONTAL SCROLL */}
        {filteredPackages.length === 0 ? (
          <p className="text-center text-gray-500">
            No packages available at the moment.
          </p>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scroll-smooth
            snap-x snap-mandatory scrollbar-hide px-6"
          >
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className="min-w-[380px] max-w-[380px] snap-start"
              >
                <PackageCard pkg={pkg} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Packages;