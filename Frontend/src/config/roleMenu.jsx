// src/config/roleMenus.js
export const roleMenus = {
  admin: [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Appointments", path: "/admin/appointments" },
    { name: "Services", path: "/admin/services-admin" },
    { name: "Packages", path: "/admin/packages-admin" },
    { name: "Reviews", path: "/admin/reviews" },
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
    { name: "Dashboard", path: "/manager/dashboard" },
    { name: "Reports", path: "/manager/reports" },
  ],

  inventory_manager: [
    { name: "Dashboard", path: "/inventory/dashboard" },
    { name: "Stock", path: "/inventory/stock" },
    { name: "Products", path: "/inventory/products" },
  ],

  receptionist: [
    { name: "Dashboard", path: "/receptionist/dashboard" },
    { name: "Appointments", path: "/receptionist/appointments" },
    { name: "WalkIn Appointments", path: "/receptionist/walkin" },
  ],

  staff: [
    { name: "Dashboard", path: "/staff/dashboard" },
    { name: "Tasks", path: "/staff/tasks" },
  ],
};
