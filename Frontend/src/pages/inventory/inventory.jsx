import { useState } from "react";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import AttendanceActions from "../../components/attendance/AttendanceActions";
import StockAlertsOverview from "../../components/inventory/StockAlertsOverview";

export default function Inventory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">Inventory Dashboard</h1>

          {/* Mark Own Attendance */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <AttendanceActions />
          </div>

          {/* Stock Alerts */}
          <div>
            <h2 className="text-lg font-medium mb-3">Stock Alerts</h2>
            <StockAlertsOverview />
          </div>
        </section>
      </main>
    </div>
  );
}
