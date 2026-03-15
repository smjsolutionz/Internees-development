import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");

  // Safely parse the user from localStorage
  let storedUser = null;
  try {
    const userData = localStorage.getItem("user");
    storedUser = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    storedUser = null;
  }

  // Redirect to login if no token or user
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is allowed
  const userRole = storedUser.role?.toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Everything is fine, render children
  return children;
};

export default ProtectedRoute;