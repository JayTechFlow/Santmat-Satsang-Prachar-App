/**
 * ============================================================================
 * संतमत सत्संग प्रचार - मुख्य ऍप्लिकेशन रूट
 * ============================================================================
 * Root router: URL-driven navigation. Shows LoginPage when signed out,
 * AdminLayout when admin session is active. No mock/PIN auth.
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
import { LoginPage } from './components/admin/LoginPage';

export default function App() {
  return (
    <Router>
      <AdminPermissionProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/users" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<>'users'</>} />
              <Route path="playlists" element={<>'playlists'</>} />
              <Route path="notifications" element={<>'notifications'</>} />
              <Route path="banners" element={<>'banners'</>} />
              <Route path="categories" element={<>'categories'</>} />
              <Route path="reports" element={<>'reports'</>} />
              <Route path="settings" element={<>'settings'</>} />
              <Route path="support" element={<>'support'</>} />
              <Route path="books" element={<>'books'</>} />
              <Route path="search" element={<>'search'</>} />
              <Route path="stuti-vinati" element={<>'stuti'</>} />
              <Route path="add-bhajan" element={<>'add-bhajan'</>} />
              <Route path="bhajan-list" element={<>'bhajan-list'</>} />
            </Route>
          </Routes>
        </AppProvider>
      </AdminPermissionProvider>
    </Router>
  );
}