import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionContext';
import { LoadingOverlay } from '../ui/LoadingOverlay';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAnyAdmin, isSuspended } = usePermissions();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay message="प्रमाणिकता जाँची जा रही है…" />;
  }

  if (!user || !isAnyAdmin || isSuspended) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AuthWrapper = ProtectedRoute;
