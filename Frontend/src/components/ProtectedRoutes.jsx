import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  const userRole = storedUser.role?.toLowerCase();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;