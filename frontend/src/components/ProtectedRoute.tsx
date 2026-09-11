import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  redirectTo?: string;
}

/**
 * Protects a route by checking authentication and role.
 * Redirects unauthenticated users to /login.
 * Redirects authenticated users with wrong role to their portal.
 */
export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate portal based on role
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'GUARD') return <Navigate to="/guard/scan" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
