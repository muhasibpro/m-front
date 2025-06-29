import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./your-auth-context-file"; // to‘g‘ri path yozing!

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}