// src/config/roleMenus.js
export const roleMenus = {
  admin: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Appointments", path: "/appointments" },
    { name: "Services", path: "/services-admin" },
    { name: "Packages", path: "/packages-admin" },
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
