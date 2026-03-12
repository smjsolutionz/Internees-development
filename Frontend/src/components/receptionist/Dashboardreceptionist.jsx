import { useState } from "react";
import ReceptionistSidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import AttendanceOverview from "../../components/attendance/AttendanceOverview";
import AttendanceActions from "../../components/attendance/AttendanceActions";

export default function ReceptionDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ReceptionistSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <section className="p-4 sm:p-6">
          <h1 className="text-2xl font-semibold mb-6">
            Receptionist Dashboard
          </h1>

          {/* Mark Own Attendance */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <AttendanceActions />
          </div>

          {/* Staff Attendance Overview */}
          <div>
            <h2 className="text-lg font-medium mb-3">Staff Attendance Overview (Today)</h2>
            <AttendanceOverview />
          </div>
        </section>
      </main>
    </div>
  );
}
