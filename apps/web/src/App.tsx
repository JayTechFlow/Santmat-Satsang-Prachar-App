/**
 * ============================================================================
 * संतमत सत्संग प्रचार - मुख्य ऍप्लिकेशन रूट (Master Application Router)
 * ============================================================================
 * URL-driven protected router architecture. Unauthenticated requests to / or
 * /admin/* redirect to /login. Successful authentication redirects to /admin.
 */
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminPermissionProvider, usePermissions } from './context/PermissionContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginPage } from './components/admin/LoginPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/ToastProvider';

// Admin Page Component Imports
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminDevoteesManager } from './components/admin/AdminDevoteesManager';
import { AdminPlaylists } from './components/admin/AdminPlaylists';
import { AdminNotificationsManager } from './components/admin/AdminNotificationsManager';
import { AdminBannerManager } from './components/admin/AdminBannerManager';
import { AdminCategoryManager } from './components/admin/AdminCategoryManager';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminSupport } from './components/admin/AdminSupport';
import { AdminBooks } from './components/admin/AdminBooks';
import { AdminSearch } from './components/admin/AdminSearch';
import { AdminStutiManager } from './components/admin/AdminStutiManager';
import { AdminAddBhajan } from './components/admin/AdminAddBhajan';
import { AdminBhajanList } from './components/admin/AdminBhajanList';

/**
 * RootRoute redirect handler:
 * Unauthenticated -> /login
 * Authenticated Admin -> /admin
 */
const RootRedirect: React.FC = () => {
  const { user, loading, isAnyAdmin, isSuspended } = usePermissions();

  if (loading) {
    return <LoadingOverlay message="प्रमाणिकता जाँची जा रही है…" />;
  }

  if (user && isAnyAdmin && !isSuspended) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/login" replace />;
};

/**
 * LoginRoute handler:
 * Unauthenticated -> LoginPage
 * Authenticated Admin -> /admin (or originally requested path)
 */
const LoginRoute: React.FC = () => {
  const { user, loading, isAnyAdmin, isSuspended } = usePermissions();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay message="प्रमाणिकता जाँची जा रही है…" />;
  }

  if (user && isAnyAdmin && !isSuspended) {
    const fromPath = (location.state as any)?.from?.pathname;
    const targetPath = fromPath && fromPath.startsWith('/admin') ? fromPath : '/admin';
    return <Navigate to={targetPath} replace />;
  }

  return <LoginPage />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AdminPermissionProvider>
          <AppProvider>
            <ToastProvider>
              <Routes>
                {/* Root route handling */}
                <Route path="/" element={<RootRedirect />} />

                {/* Login route handling */}
                <Route path="/login" element={<LoginRoute />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminDevoteesManager />} />
                  <Route path="playlists" element={<AdminPlaylists />} />
                  <Route path="notifications" element={<AdminNotificationsManager />} />
                  <Route path="banners" element={<AdminBannerManager />} />
                  <Route path="categories" element={<AdminCategoryManager />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="search" element={<AdminSearch />} />
                  <Route path="stuti-vinati" element={<AdminStutiManager />} />
                  <Route path="add-bhajan" element={<AdminAddBhajan />} />
                  <Route path="bhajan-list" element={<AdminBhajanList />} />
                  <Route path="media" element={<Navigate to="/admin/bhajan-list" replace />} />
                  <Route path="audio" element={<Navigate to="/admin/bhajan-list" replace />} />
                  <Route path="suvichar" element={<Navigate to="/admin/banners" replace />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </AppProvider>
        </AdminPermissionProvider>
      </Router>
    </ErrorBoundary>
  );
}