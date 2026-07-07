import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { hasPermission } from '@/lib/permissions';

interface ProtectedRouteProps {
  requiredPermission?: string;
}

export default function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
