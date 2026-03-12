import { useState } from "react";
import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import AttendanceActions from "../../components/attendance/AttendanceActions";

export default function Staff() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">Staff Dashboard</h1>

          {/* Today's Attendance - Check In, Check Out, Leave */}
          <div className="bg-white rounded-lg shadow p-6">
            <AttendanceActions />
          </div>
        </section>
      </main>
    </div>
  );
}
