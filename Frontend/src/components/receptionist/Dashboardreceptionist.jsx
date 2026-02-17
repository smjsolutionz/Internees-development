import { useState } from "react";
import ReceptionistSidebar from "../../components/receptionist/receptionistsidebar";
import Topbar from "../../components/admin/TopbarAdmin";


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

       
        </section>
      </main>
    </div>
  );
}
