/**
 * ============================================================================
 * संतमत सत्संग प्रचार - मास्टर एडमिन पोर्टल लेआउट
 * ============================================================================
 * Central layout for the administration panel hosting the sidebar navigation,
 * top global header, and dynamic administrative modules.
 * Uses React Router for URL-driven page rendering via <Outlet>.
 * Handles authentication redirection via AuthWrapper.
 */
import React from 'react';
import { Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout: React.FC = () => {
  const { user } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check: redirect to login if not authenticated
  if (!user) {
    navigate('/login', { replace: true });
    return <Navigate to="/login" replace />;
  }

  const getHeaderTitle = () => {
    const path = location.pathname;
    // Strip /admin prefix for title determination
    const adminPath = path.replace('/admin', '').replace('/', '') || 'dashboard';
    const titles: Record<string, string> = {
      dashboard: 'डैशबोर्ड एवं सांख्यिकी',
      users: 'सत्संगी भक्त समुदाय एवं साधना विवरण',
      playlists: 'भजन प्लेलिस्ट्स प्रबंधन',
      notifications: 'सूचनाएँ एवं उद्घोषणाएँ भेजें',
      banners: 'बैनर प्रबंधन (होम स्क्रीन इमेज एवं विचार)',
      categories: 'श्रेणियाँ एवं उप-श्रेणियाँ प्रबंधन',
      reports: 'विस्तृत रिपोर्ट और एनालिटिक्स',
      settings: 'ऐप एवं सुरक्षा सेटिंग्स',
      support: 'भक्त सहायता संदेश',
      books: 'पुस्तकालय प्रबंधन',
      search: 'वैश्विक खोज',
      'stuti-vinati': 'स्तुति-बिनती प्रबंधन (प्रातः एवं संध्या)',
      'add-bhajan': 'भजन प्रबंधन',
      'bhajan-list': 'भजन प्रबंधन',
    };
    return titles[adminPath] || 'संतमत एडमिन पोर्टल';
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