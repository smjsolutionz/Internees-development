import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(storedUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
