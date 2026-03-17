import { Link, useLocation } from "react-router-dom";

export default function SidebarStaff({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/staff" },
    { name: "My Tasks", path: "/staff/tasks" },
    { name: "Appointments", path: "/staff/appointments" },
  ];

  return (
    <aside className="fixed md:relative w-64 bg-gray-800 text-white">
      <div className="p-5 font-bold border-b border-white/10">
        Staff Portal
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block px-4 py-2 rounded ${
              location.pathname === item.path
                ? "bg-gray-600"
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
