import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * --------------
 * - Checks JWT token
 * - Allows access if authenticated
 * - Redirects to login if not
 */

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in
  return children;
}
