import { forwardRef, useCallback } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { usePermissions, type PermissionContext } from '../../core/auth/PermissionContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuArrow,
} from '../ui/DropdownMenu';

interface UserMenuTriggerProps {
  name: string;
  email: string;
  role: PermissionContext['role'];
  initials: string;
}

function RoleBadge({ role }: { role: PermissionContext['role'] }) {
  const getRoleLabel = () => {
    switch (role) {
      case 'developer_super_admin':
        return 'Platform Admin';
      case 'client_super_admin':
        return 'Organization Admin';
      case 'mobile_user':
        return 'User';
      default:
        return 'Admin';
    }
  };

  const getRoleVariant = () => {
    switch (role) {
      case 'developer_super_admin':
        return 'badge-warning';
      case 'client_super_admin':
        return 'badge-primary';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <span className={`badge ${getRoleVariant()}`}>
      {getRoleLabel()}
    </span>
  );
}

function UserAvatar({ initials, size = 'default' }: { initials: string; size?: 'default' | 'large' }) {
  const sizeClass = size === 'large' ? 'size-large' : '';
  return (
    <div className={`user-avatar ${sizeClass}`}>
      {initials}
    </div>
  );
}

export const UserMenu = forwardRef<HTMLButtonElement, UserMenuTriggerProps>(
  ({ name, email, role, initials }, ref) => {
    const { logout, context } = usePermissions();
    const navigate = useNavigate();

    const handleLogout = useCallback(async () => {
      await logout();
    }, [logout]);

    const handleProfile = useCallback(() => {
      const profileUrl = context?.customClaims?.profileUrl;
      if (typeof profileUrl === 'string') {
        window.open(profileUrl, '_blank', 'noopener,noreferrer');
      }
    }, [context]);

    const handleSettings = useCallback(() => {
      navigate('/settings');
    }, [navigate]);

    const profileUrl = context?.customClaims?.profileUrl;
    const hasProfileUrl = typeof profileUrl === 'string';

    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          ref={ref}
          asChild
          aria-label="User menu"
        >
          <button
            className="user-menu-trigger"
            type="button"
            aria-haspopup="menu"
          >
            <div className="user-info">
              <p className="user-name">{name}</p>
              <p className="user-role">{role && <RoleBadge role={role} />}</p>
            </div>
            <UserAvatar initials={initials} />
            <ChevronDown size={16} className="menu-chevron" color="var(--text-muted)" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={8}
            collisionPadding={16}
            className="user-menu-content"
          >
            <DropdownMenuArrow />
            
            <div className="user-menu-header">
              <UserAvatar initials={initials} size="large" />
              <div className="user-menu-header-info">
                <p className="user-menu-header-name">{name}</p>
                <p className="user-menu-header-email">{email}</p>
                {role && <RoleBadge role={role} />}
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Account</DropdownMenuLabel>

            {hasProfileUrl && (
              <DropdownMenuItem
                onSelect={handleProfile}
                className="menu-item-with-icon"
              >
                <User size={16} className="menu-item-icon" />
                Profile
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onSelect={handleSettings}
              className="menu-item-with-icon"
            >
              <Settings size={16} className="menu-item-icon" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={handleLogout}
              className="menu-item-danger menu-item-with-icon"
            >
              <LogOut size={16} className="menu-item-icon" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    );
  }
);

UserMenu.displayName = 'UserMenu';