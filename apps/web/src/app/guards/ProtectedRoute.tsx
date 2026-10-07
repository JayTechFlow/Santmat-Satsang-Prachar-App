import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions, useRouteAccess } from '../providers/PermissionContext';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { SITE_CONFIG } from '../../config/siteConfig';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAnyAdmin, isSuspended } = usePermissions();
  const location = useLocation();
  const hasAccess = useRouteAccess(location.pathname);

  if (loading) {
    return <LoadingOverlay message="प्रमाणिकता जाँची जा रही है…" />;
  }

  if (!user || !isAnyAdmin || isSuspended) {
    return <Navigate to={SITE_CONFIG.routes.adminLogin} state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to={SITE_CONFIG.routes.adminDashboard} replace />;
  }

  return <>{children}</>;
};

