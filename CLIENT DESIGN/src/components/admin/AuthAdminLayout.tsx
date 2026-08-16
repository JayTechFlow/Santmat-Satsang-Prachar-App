import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionContext';
import { LoadingSplash } from '../../App';

const AuthAdminLayout: React.FC = () => {
  const { user, loading } = usePermissions();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSplash />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export { AuthAdminLayout };