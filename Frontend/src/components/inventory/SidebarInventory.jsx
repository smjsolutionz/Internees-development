import { Link, useLocation } from "react-router-dom";

export default function SidebarInventory({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/inventory" },
    { name: "Products", path: "/inventory/products" },
    { name: "Stock Levels", path: "/inventory/stock" },
    { name: "Suppliers", path: "/inventory/suppliers" },
  ];

  return (
    <aside className="fixed md:relative w-64 bg-green-900 text-white">
      <div className="p-5 font-bold border-b border-white/10">
        Inventory Portal
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block px-4 py-2 rounded ${
              location.pathname === item.path
                ? "bg-green-600"
                : "hover:bg-white/10"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
