// src/config/roleMenus.js
export const roleMenus = {
  admin: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Attendance", path: "/attendance" },
    { name: "Appointments", path: "/appointments" },
    { name: "Services", path: "/services-admin" },
    { name: "Packages", path: "/packages-admin" },
    { name: "Reviews", path: "/admin/reviews" },
    { name: "Bills", path: "/receptionist/bills" }, 
    { name: "Revenue Report", path: "/admin/revenue" },
    {
      name: "Gallery",
      dropdown: [
        { name: "All Images", path: "/gallery-admin" },
        { name: "Add New Image", path: "/gallery-admin/add" },
      ],
    },
    {
      name: "Team",
      dropdown: [
        { name: "All Members", path: "/admin/team" },
        { name: "Add Member", path: "/admin/team/add" },
      ],
    },
  ],

  manager: [
    { name: "Dashboard", path: "/manager" },
    { name: "Attendance", path: "/attendance" },
    { name: "View My Attendance", path: "/attendance/my" },
    { name: "Reports", path: "/manager/reports" },
  ],

  inventory_manager: [
    { name: "Dashboard", path: "/inventory" },
    { name: "View My Attendance", path: "/attendance/my" },
    { name: "Stock", path: "/inventory/stock" },
    { name: "Products", path: "/inventory/products" },
  ],

  receptionist: [
    { name: "Dashboard", path: "/receptionist/dashboard" },
    { name: "Attendance", path: "/attendance" },
    { name: "View My Attendance", path: "/attendance/my" },
    { name: "Appointments", path: "/receptionist/appointments" },
    { name: "WalkIn Appointments", path: "/receptionist/walkin" },
    { name: "Bills", path: "/receptionist/bills" }, 
  ],

  staff: [
    { name: "Dashboard", path: "/staff" },
    { name: "View My Attendance", path: "/attendance/my" },
    { name: "Shifts", path: "/staff/tasks" },
  ],
};
