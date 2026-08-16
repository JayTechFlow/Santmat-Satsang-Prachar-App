// Sprint E1 — Admin Panel Route Protection
// Protected routes with permission-based access control.

import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions, useRouteAccess } from './PermissionContext';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function ProtectedRoute({ children, fallbackPath = '/' }: ProtectedRouteProps) {
  const { loading, context } = usePermissions();
  const location = useLocation();
  const hasAccess = useRouteAccess(location.pathname);

  if (loading) {
    return <LoadingOverlay message="Checking permissions..." />;
  }

  if (!context) {
    // Not authenticated - redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    // Authenticated but not authorized
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Wrapper for the entire admin panel (after login)
export function AdminPanelRoutes({ children }: { children: React.ReactNode }) {
  const { loading, context } = usePermissions();

  if (loading) {
    return <LoadingOverlay message="Loading admin panel..." />;
  }

  if (!context) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Hook for checking access to a specific action (for buttons, menus, etc.)
export function useActionAccess(permissionId: string): boolean {
  const { authorize } = usePermissions();
  const result = authorize(permissionId);
  return result.allowed;
}

// Component for showing/hiding based on action permission
interface ActionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export function ActionGate({ children, permission, fallback = null }: ActionGateProps) {
  const allowed = useActionAccess(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}