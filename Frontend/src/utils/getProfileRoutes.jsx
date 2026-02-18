// src/utils/getProfileRoutes.js

export const getProfileRoute = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const role = storedUser?.role?.toLowerCase();

  switch (role) {
    case "admin":
      return "/admin/profile";

    case "customer":
      return "/customer/profile";

    case "receptionist":
      return "/admin/profile"; // uses same profile page

    case "inventory_manager":
      return "/admin/profile";

    case "manager":
      return "/admin/profile";

    case "staff":
      return "/admin/profile";

    default:
      return "/login";
  }
};
