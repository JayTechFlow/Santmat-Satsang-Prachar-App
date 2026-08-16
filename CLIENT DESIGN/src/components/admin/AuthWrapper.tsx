import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionContext';

const AuthWrapper: React.FC = ({ children }) => {
  const { user } = usePermissions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export { AuthWrapper };