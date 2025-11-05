import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedForAdminOnly = false }) => {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("email");
  const location = useLocation();

  const isAuthenticated = !!token;
  const isAdmin = userEmail === "jethanandj52@gmail.com";

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedForAdminOnly && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PrivateRoute;
