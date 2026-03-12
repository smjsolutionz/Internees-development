import Sidebar from "../../components/admin/SidebarAdmin";
import Topbar from "../../components/admin/TopbarAdmin";
import AdminAppointments from "../../components/admin/AdminAppointments";
import { useState } from "react";

export default function AddGalleryImage() {
   const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}  />
      <main className="flex-1">
        <Topbar setSidebarOpen={setSidebarOpen}/>
        <div className="p-6">
          <AdminAppointments />
        </div>
      </main>
    </div>
  );
}
