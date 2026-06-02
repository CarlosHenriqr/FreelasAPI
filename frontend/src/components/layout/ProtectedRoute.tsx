import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, UserType } from '@/types/api';
import { PageLoader } from '@/components/feedback/PageLoader';

type ProtectedRouteProps = {
  allowedTypes?: UserType[];
  allowedRoles?: UserRole[];
};

export function ProtectedRoute({ allowedTypes, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.type)) {
    const fallback =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.type === 'company'
          ? '/empresa/dashboard'
          : '/freelancer/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const path =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.type === 'company'
          ? '/empresa/dashboard'
          : '/freelancer/dashboard';
    return <Navigate to={path} replace />;
  }

  return <Outlet />;
}

export function RootLoader() {
  return <PageLoader />;
}
