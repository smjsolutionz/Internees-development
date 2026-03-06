import React, { useState } from 'react'
import Staffshift from '../../components/staff/Staffshift'
import Sidebarstaff from '../../components/admin/SidebarAdmin';
import Topbar from '../../components/admin/TopbarAdmin';// Make sure this exists

const StaffShiftPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebarstaff sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <div className="p-6">
          <Staffshift />
        </div>
      </main>
    </div>
  );
};

export default StaffShiftPage;