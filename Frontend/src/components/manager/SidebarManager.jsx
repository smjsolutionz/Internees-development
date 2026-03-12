import { Link, useLocation } from "react-router-dom";

export default function SidebarManager({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/manager" },
    { name: "Reports", path: "/manager/reports" },
    { name: "Staff Management", path: "/manager/staff" },
    { name: "Performance", path: "/manager/performance" },
  ];

  return (
    <aside className={`fixed md:relative w-64 bg-purple-900 text-white`}>
      <div className="p-5 font-bold border-b border-white/10">
        Manager Portal
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block px-4 py-2 rounded ${
              location.pathname === item.path
                ? "bg-purple-600"
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
