/**
 * ============================================================================
 * संतमत सत्संग प्रचार - मास्टर एडमिन पोर्टल लेआउट
 * ============================================================================
 * Central layout for the administration panel hosting the sidebar navigation,
 * top global header, and dynamic administrative modules.
 * Uses React Router for URL-driven page rendering via <Outlet>.
 * Handles authentication redirection internally.
 */
import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const { user, loading } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check: redirect to login if not authenticated
  if (!user) {
    navigate('/login', { replace: true });
    return <Navigate to="/login" replace />;
  }

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/' || path === '/admin/dashboard') {
      return 'डैशबोर्ड एवं सांख्यिकी';
    }
    if (path === '/admin/users' || path === '/admin/users/') {
      return 'सत्संगी भक्त समुदाय एवं साधना विवरण';
    }
    if (path === '/admin/playlists') {
      return 'भजन प्लेलिस्ट्स प्रबंधन';
    }
    if (path === '/admin/notifications') {
      return 'सूचनाएँ एवं उद्घोषणाएँ भेजें';
    }
    if (path === '/admin/banners') {
      return 'बैनर प्रबंधन (होम स्क्रीन इमेज एवं विचार)';
    }
    if (path === '/admin/categories') {
      return 'श्रेणियाँ एवं उप-श्रेणियाँ प्रबंधन';
    }
    if (path === '/admin/reports' || path.startsWith('/admin/reports/')) {
      return 'विस्तृत रिपोर्ट और एनालिटिक्स';
    }
    if (path === '/admin/settings') {
      return 'ऐप एवं सुरक्षा सेटिंग्स';
    }
    if (path === '/admin/support') {
      return 'भक्त सहायता संदेश';
    }
    if (path === '/admin/books') {
      return 'पुस्तकालय प्रबंधन';
    }
    if (path === '/admin/search') {
      return 'वैश्विक खोज';
    }
    if (path === '/admin/stuti-vinati' || path.startsWith('/admin/stuti')) {
      return 'स्तुति-बिनती प्रबंधन (प्रातः एवं संध्या)';
    }
    if (path === '/admin/add-bhajan' || path === '/admin/bhajan-list') {
      return 'भजन प्रबंधन';
    }
    return 'संतमत एडमिन पोर्टल';
  };

  return (
    <div className="flex h-screen w-full bg-[#FBF9F5] text-stone-900 overflow-hidden font-['Mukta']">
      {/* Left Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Right Content Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader title={getHeaderTitle()} />
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};