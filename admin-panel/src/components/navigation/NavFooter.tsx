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
      {!collapsed && (
        <div className="p-3.5 mx-2 mb-2 bg-[#FFFBF0] rounded-2xl border border-amber-200">
          <h4 className="font-['Mukta'] font-bold text-xs text-amber-900 mb-1">
            सहायता की आवश्यकता है?
          </h4>
          <p className="font-['Mukta'] text-[0.7rem] text-stone-600 leading-tight">
            admin@santmat.app
          </p>
          <p className="font-['Mukta'] text-[0.7rem] text-stone-600 leading-tight mt-0.5">
            +91 12345 67890
          </p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="nav-link nav-footer-logout"
        aria-label="Logout"
      >
        <LogOut size={collapsed ? 24 : 20} aria-hidden="true" />
        {!collapsed && (
          <>
            <span>सुरक्षित लॉग आउट</span>
            <span className="nav-footer-role">{roleLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}