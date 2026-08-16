import { LogOut } from 'lucide-react';
import { usePermissions } from '../../core/auth/PermissionContext';

interface NavFooterProps {
  collapsed: boolean;
}

export function NavFooter({ collapsed }: NavFooterProps) {
  const { logout, currentRole } = usePermissions();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const roleLabel =
    currentRole === 'developer_super_admin'
      ? 'Platform Admin'
      : currentRole === 'client_super_admin'
      ? 'Organization Admin'
      : 'Admin Panel';

  return (
    <div className="nav-footer">
      <button
        onClick={handleLogout}
        className="nav-link nav-footer-logout"
        aria-label="Logout"
      >
        <LogOut size={collapsed ? 24 : 20} aria-hidden="true" />
        {!collapsed && (
          <>
            <span>Logout</span>
            <span className="nav-footer-role">{roleLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}