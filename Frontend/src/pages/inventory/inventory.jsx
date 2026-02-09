import { useState } from "react";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";

export default function Reception() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold">Inventory Dashboard</h1>
        </div>
      </main>
    </div>
  );
}
