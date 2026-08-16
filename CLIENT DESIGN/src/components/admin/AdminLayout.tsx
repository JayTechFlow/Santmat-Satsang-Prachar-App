/**
 * ============================================================================
 * संतमत सत्संग प्रचार - मास्टर एडमिन पोर्टल लेआउट
 * ============================================================================
 * Central layout with sidebar + header. Uses <Outlet> for child routes.
 * Auth check handled by AuthWrapper in App route.
 */
import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const { adminTab } = useApp();
  const location = useLocation();

  const getHeaderTitle = () => {
    const path = location.pathname;
    // Determine title from URL path
    if (path === '/admin' || path === '/admin/' || path === '/admin/dashboard') {
      return 'डैशबोर्ड एवं सांख्यिकी';
    }
    if (path === '/admin/users' || path === '/admin/users/') {
      return 'सत्संगी भक्त समुदाय';
    }
    if (path === '/admin/playlists') {
      return 'भजन प्लेलिस्ट्स';
    }
    if (path === '/admin/notifications') {
      return 'सूचनाएँ';
    }
    if (path === '/admin/banners') {
      return 'बैनर प्रबंधन';
    }
    if (path === '/admin/categories') {
      return 'श्रेणियाँ';
    }
    if (path === '/admin/reports') {
      return 'रिपोर्ट';
    }
    if (path === '/admin/settings') {
      return 'सेटिंग्स';
    }
    if (path === '/admin/support') {
      return 'समर्थन';
    }
    if (path === '/admin/books') {
      return 'पुस्तकें';
    }
    if (path === '/admin/search') {
      return 'खोज';
    }
    if (path === '/admin/stuti-vinati' || path.startsWith('/admin/stuti')) {
      return 'स्तुति-बिनती';
    }
    if (path === '/admin/add-bhajan' || path === '/admin/bhajan-list') {
      return 'भजन प्रबंधन';
    }
    return 'संतमत एडमिन पोर्टल';
  };

  return (
    <div className="flex h-screen w-full bg-[#FBF9F5] text-stone-900 overflow-hidden font-['Mukta']">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader title={getHeaderTitle()} />
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};