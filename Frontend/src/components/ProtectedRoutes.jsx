import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");

  // Safe parsing of stored user
  let storedUser = null;
  try {
    const userStr = localStorage.getItem("user");
    storedUser = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Failed to parse user from localStorage:", err);
    storedUser = null;
  }

  // Redirect if no token or user
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  const userRole = storedUser.role?.toLowerCase();

  // Redirect if role is not allowed
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;