/**
 * ============================================================================
 * संतमत सत्संग प्रचार — एडमिन डैशबोर्ड रूटर (Admin Dashboard)
 * ============================================================================
 * ADMIN DASHBOARD: https://santmatsatsangparchar.in/admin
 *
 * Serves exclusively under /admin/** on the canonical public origin.
 *
 * Routes:
 * - /admin/login        -> Authentication (Google / email)
 * - /admin/dashboard    -> Dashboard
 * - /admin/users        -> Devotee management
 * - /admin/reports      -> Reports & analytics
 * - /admin/media        -> Media control center
 * - /admin/banners      -> Banner management
 *   ... (all existing admin modules remain unchanged)
 *
 * Legacy /login is redirected to /admin/login for backward compatibility.
 * Unknown paths resolve to the secure admin entry (login or dashboard).
 */
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminPermissionProvider, usePermissions } from './providers/PermissionContext';
import { AppProvider } from './providers/AppContext';
import { AdminLayout } from '../components/layout/AdminLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ToastProvider } from '../components/ui/ToastProvider';
import { SITE_CONFIG } from '../config/siteConfig';

/**
 * Helper to lazy load components with automatic retry/reload when dynamic import fails
 * (e.g. due to new deployment updating asset chunk hashes while user has active session).
 */
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenReloaded = JSON.parse(
      sessionStorage.getItem('retry-lazy-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      sessionStorage.removeItem('retry-lazy-refreshed');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        sessionStorage.setItem('retry-lazy-refreshed', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      sessionStorage.removeItem('retry-lazy-refreshed');
      throw error;
    }
  });
}

// Admin module pages are lazy-loaded: the authentication entry loads only the
// login + application shell. Admin feature bundles are fetched on demand so the
// public homepage never downloads them, and the login page stays lightweight.
const AdminDashboard = lazyWithRetry(() =>
  import('../features/dashboard/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminDevoteesManager = lazyWithRetry(() => import('../features/users/pages/AdminDevoteesManager'));
const AdminPlaylists = lazyWithRetry(() =>
  import('../features/playlists/pages/AdminPlaylists').then((m) => ({ default: m.AdminPlaylists }))
);
const AdminNotificationsManager = lazyWithRetry(() =>
  import('../features/notifications/pages/AdminNotificationsManager').then((m) => ({ default: m.AdminNotificationsManager }))
);
const AdminBannerManager = lazyWithRetry(() =>
  import('../features/banners/pages/AdminBannerManager').then((m) => ({ default: m.AdminBannerManager }))
);
const AdminCategoryManager = lazyWithRetry(() =>
  import('../features/categories/pages/AdminCategoryManager').then((m) => ({ default: m.AdminCategoryManager }))
);
const AdminReports = lazyWithRetry(() => import('../features/dashboard/pages/AdminReports'));
const AdminSettings = lazyWithRetry(() =>
  import('../features/dashboard/pages/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);
const AdminSupport = lazyWithRetry(() =>
  import('../features/dashboard/pages/AdminSupport').then((m) => ({ default: m.AdminSupport }))
);
const AdminBooks = lazyWithRetry(() =>
  import('../features/books/pages/AdminBooks').then((m) => ({ default: m.AdminBooks }))
);
const AdminSearch = lazyWithRetry(() =>
  import('../components/admin/AdminSearch').then((m) => ({ default: m.AdminSearch }))
);
const AdminStutiManager = lazyWithRetry(() =>
  import('../features/stuti/pages/AdminStutiManager').then((m) => ({ default: m.AdminStutiManager }))
);
const AdminAddBhajan = lazyWithRetry(() =>
  import('../features/audio/pages/AdminAddBhajan').then((m) => ({ default: m.AdminAddBhajan }))
);
const AdminBhajanList = lazyWithRetry(() =>
  import('../features/audio/pages/AdminBhajanList').then((m) => ({ default: m.AdminBhajanList }))
);
const AdminMediaLibrary = lazyWithRetry(() =>
  import('../components/media/AdminMediaLibrary').then((m) => ({ default: m.AdminMediaLibrary }))
);

/**
 * Secure admin entry point for "/" (i.e. the /admin path on the public origin).
 * Authenticated admins land on the dashboard, everyone else on the login page.
 */
const AdminRootRedirect: React.FC = () => {
  const { user, loading, isAnyAdmin, isSuspended } = usePermissions();

  if (loading) {
    return <LoadingOverlay message="प्रमाणिकता जाँची जा रही है…" />;
  }

  if (user && isAnyAdmin && !isSuspended) {
    return <Navigate to={SITE_CONFIG.routes.adminDashboard} replace />;
  }

  return <Navigate to={SITE_CONFIG.routes.adminLogin} replace />;
};

/**
 * LoginRoute handler:
 * Unauthenticated -> LoginPage
 * Authenticated Admin -> /admin/dashboard (or originally requested admin path)
 */
const LoginRoute: React.FC = () => {
  const { user, loading, isAnyAdmin, isSuspended } = usePermissions();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay message="प्रमाणिकता जाँची जा रही है…" />;
  }

  if (user && isAnyAdmin && !isSuspended) {
    const fromPath = (location.state as any)?.from?.pathname;
    const targetPath = fromPath && fromPath.startsWith(SITE_CONFIG.adminPath)
      ? fromPath
      : SITE_CONFIG.routes.adminDashboard;
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
                {/* Authentication (canonical: /admin/login) */}
                <Route path={SITE_CONFIG.routes.adminLogin} element={<LoginRoute />} />

                {/* Legacy alias: /login -> /admin/login (backward compatibility) */}
                <Route
                  path="/login"
                  element={<Navigate to={SITE_CONFIG.routes.adminLogin} replace />}
                />

                {/* Secure admin entry: /admin and /admin/ */}
                <Route path={SITE_CONFIG.adminPath} element={<AdminRootRedirect />} />

                {/* Protected Admin Module Routes */}
                <Route
                  path={`${SITE_CONFIG.adminPath}/*`}
                  element={
                    <ProtectedRoute>
                      <Suspense
                        fallback={<LoadingOverlay message="मॉड्यूल लोड हो रहा है… (Loading module)" />}
                      >
                        <AdminLayout />
                      </Suspense>
                    </ProtectedRoute>
                  }
                >
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
                  <Route path="devotees" element={<AdminDevoteesManager />} />
                  <Route path="stuti" element={<AdminStutiManager />} />
                  {/* Unknown nested admin paths resolve to the secure entry */}
                  <Route path="*" element={<AdminRootRedirect />} />
                </Route>

                {/* Any other absolute path resolves to the secure admin entry */}
                <Route path="*" element={<AdminRootRedirect />} />
              </Routes>
            </ToastProvider>
          </AppProvider>
        </AdminPermissionProvider>
      </Router>
    </ErrorBoundary>
  );
}