import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import { Role } from '../types';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Redirects to /login if user is not authenticated.
// While auth is loading (checking cookie), shows a full-screen spinner.

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// ─── RoleGuard ────────────────────────────────────────────────────────────────
// Only allows through users whose role is in the `allowedRoles` list.
// Redirects unauthorized users to /unauthorized.

export const RoleGuard: React.FC<{ allowedRoles: Role[] }> = ({
  allowedRoles,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// ─── GuestRoute ───────────────────────────────────────────────────────────────
// Redirects logged-in users away from /login and /register to /dashboard

export const GuestRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
