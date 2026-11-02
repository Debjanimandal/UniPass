import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../services/api.client';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  redirectTo?: string;
}

/**
 * Protects a route by checking authentication and role.
 *
 * The persisted auth store can hold a token that has already expired on the
 * server. A page that only calls public endpoints would then render a stale
 * "logged-in" view. To prevent that, this guard validates the session against
 * the backend (`GET /auth/me`) on entry:
 *   - If the token is valid, it refreshes the stored user (so the role is
 *     always current) and renders the route.
 *   - If the token is expired/invalid, the API interceptor clears the session;
 *     this guard then redirects to login.
 */
export default function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  // 'checking' until we confirm the token with the server at least once.
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>(
    isAuthenticated && token ? 'checking' : 'invalid'
  );
  // Dedupe the network call across React 18 StrictMode's double-mount in dev.
  const verifiedRef = useRef(false);

  useEffect(() => {
    // Nothing to verify if there's no session to begin with.
    if (!isAuthenticated || !token) {
      setStatus('invalid');
      return;
    }

    // Only run the check once; always resolve status so we never hang on
    // "checking" (StrictMode would otherwise cancel the first run's update).
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    (async () => {
      try {
        const res = await authApi.me();
        const freshUser = res.data?.data;
        // Keep the stored user in sync with the server (role, status, etc.)
        if (freshUser) {
          useAuthStore.getState().login(
            {
              id: freshUser.id,
              firstName: freshUser.firstName,
              lastName: freshUser.lastName,
              email: freshUser.email,
              phone: freshUser.phone,
              role: freshUser.role,
              isActive: freshUser.isActive,
              createdAt: freshUser.createdAt,
            },
            token
          );
        }
        setStatus('valid');
      } catch {
        // 401/403 → the interceptor already logs out; make sure locally too.
        useAuthStore.getState().logout();
        setStatus('invalid');
      }
    })();
  }, [isAuthenticated, token]);

  // No local session at all → straight to login.
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Server said the session is no longer valid.
  if (status === 'invalid') {
    return <Navigate to={redirectTo} state={{ from: location, reason: 'session-expired' }} replace />;
  }

  // Waiting on the server's verdict — avoid flashing a stale admin view.
  if (status === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '15px',
          background: '#f0f4f8',
        }}
      >
        Verifying your session...
      </div>
    );
  }

  // Session valid but wrong role → send to the correct portal.
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'GUARD') return <Navigate to="/guard/scan" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
