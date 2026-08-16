import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../context/PermissionContext';

export const AdminHeader: React.FC<{ title: string }> = ({ title }) => {
  const { notifications } = useApp();
  const { user, logout } = usePermissions();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const ROLE_LABELS: Record<string, string> = {
    developer_super_admin: 'डेवलपर सुपर एडमिन',
    client_super_admin: 'क्लाइंट एडमिन',
    mobile_user: 'मोबाइल यूज़र',
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left Title */}
      <div className="flex items-center gap-3">
        <h1 className="font-['Mukta'] font-extrabold text-xl text-stone-900">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Secure Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full font-['Mukta'] text-xs font-bold transition-all"
          title="एडमिन सत्र समाप्त करें और लॉग आउट करें"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>लॉग आउट</span>
        </button>

        {/* Notifications */}
        <div className="relative p-2 rounded-full hover:bg-stone-100 cursor-pointer text-stone-600">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold border border-amber-300">
            <span className="text-sm">
              {(user?.displayName || user?.email || 'एड').charAt(0)}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-['Mukta'] font-bold text-xs text-stone-900 leading-tight">
              {user?.displayName || user?.email || 'एडमिन'}
            </p>
            <p className="font-['Mukta'] text-[0.65rem] text-stone-500">
              {user ? ROLE_LABELS[user.role] || user.role : 'प्रमाणित एडमिन'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
