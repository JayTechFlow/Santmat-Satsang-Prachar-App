/**
 * ============================================================================
 * संतमत सत्संग प्रचार - मुख्य ऍप्लिकेशन रूट (Main Application Entry Point)
 * ============================================================================
 * Root router: shows a loading splash while the real admin session resolves,
 * then renders the LoginPage when signed out and the AdminLayout when a valid,
 * non-suspended admin session is active. There is no mock/PIN admin mode.
 * Uses React Router for URL-driven navigation with nested routes.
 */
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminPermissionProvider } from './context/PermissionContext';
import { AdminLayout } from './components/admin/AdminLayout';
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
import { AdminAddBhajan } from './components/admin/AdminAddBhajan';
import { AdminBhajanList } from './components/admin/AdminBhajanList';
import { AdminStutiManager } from './components/admin/AdminStutiManager';
import { AuthWrapper } from './components/admin/AuthWrapper';
import { LoginPage } from './components/admin/LoginPage';
import { DiyaIcon } from './components/shared/DevotionalIcons';

const LoadingSplash: React.FC = () => (
  <div className="min-h-screen w-full bg-[#FBF9F5] flex items-center justify-center select-none font-['Mukta']">
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 animate-pulse">
        <DiyaIcon className="w-14 h-14" />
      </div>
      <p className="text-xs font-bold text-stone-500">
        प्रमाणीकरण जाँचा जा रहा है…
      </p>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <AdminPermissionProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/users" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AuthWrapper><AdminLayout /></AuthWrapper>}>
              <Route index element={<Navigate to="/admin/users" replace />} />
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
            </Route>
          </Routes>
        </AppProvider>
      </AdminPermissionProvider>
    </Router>
  );
}