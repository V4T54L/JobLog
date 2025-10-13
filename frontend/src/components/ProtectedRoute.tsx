import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}