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
import { AppProvider } from './providers/AppContext';
import { AdminPermissionProvider, usePermissions } from './providers/PermissionContext';
import { AdminLayout } from '../components/layout/AdminLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ToastProvider } from '../components/ui/ToastProvider';

// Admin Page Component Imports
import { AdminDashboard } from '../features/dashboard/pages/AdminDashboard';
import { AdminDevoteesManager } from '../features/users/pages/AdminDevoteesManager';
import { AdminPlaylists } from '../features/playlists/pages/AdminPlaylists';
import { AdminNotificationsManager } from '../features/notifications/pages/AdminNotificationsManager';
import { AdminBannerManager } from '../features/banners/pages/AdminBannerManager';
import { AdminCategoryManager } from '../features/categories/pages/AdminCategoryManager';
import { AdminReports } from '../features/dashboard/pages/AdminReports';
import { AdminSettings } from '../features/dashboard/pages/AdminSettings';
import { AdminSupport } from '../features/dashboard/pages/AdminSupport';
import { AdminBooks } from '../features/books/pages/AdminBooks';
import { AdminSearch } from '../components/admin/AdminSearch';
import { AdminStutiManager } from '../features/stuti/pages/AdminStutiManager';
import { AdminAddBhajan } from '../features/audio/pages/AdminAddBhajan';
import { AdminBhajanList } from '../features/audio/pages/AdminBhajanList';
import { AdminMediaLibrary } from '../components/media/AdminMediaLibrary';

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
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                  <Route path="media" element={<AdminMediaLibrary />} />
                  <Route path="audio" element={<AdminBhajanList />} />
                  <Route path="bhajans" element={<AdminBhajanList />} />
                  <Route path="devotees" element={<AdminDevoteesManager />} />
                  <Route path="stuti" element={<AdminStutiManager />} />
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