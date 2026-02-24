
import ReceptionistSidebar from "../../components/admin/SidebarAdmin"
import Topbar from "../../components/admin/TopbarAdmin";
import ReceptionistAppointment from "../../components/receptionist/ReceptionistAppointment"
import React, { useState } from "react";
export default function Addgalleryimage() {
     const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ReceptionistSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}   />
      <main className="flex-1">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <div className="p-6">
          <ReceptionistAppointment/>
        </div>
      </main>
    </div>
  );
}
