import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminPermissionProvider } from './core/auth/PermissionContext';
import { AdminPanelRoutes, ProtectedRoute } from './core/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/ToastProvider';
import { TooltipProvider } from './components/ui/Tooltip';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { ThemeProvider } from './context/ThemeContext';

const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Suvichar = lazy(() => import('./pages/Suvichar').then(m => ({ default: m.Suvichar })));
const Banners = lazy(() => import('./pages/Banners').then(m => ({ default: m.Banners })));
const Audio = lazy(() => import('./pages/Audio').then(m => ({ default: m.Audio })));
const StutiVinati = lazy(() => import('./pages/StutiVinati').then(m => ({ default: m.StutiVinati })));
const Books = lazy(() => import('./pages/Books').then(m => ({ default: m.Books })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Playlist = lazy(() => import('./pages/Playlist').then(m => ({ default: m.Playlist })));
const Support = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AdminPermissionProvider>
            <TooltipProvider>
              <Router>
                <Suspense fallback={<LoadingOverlay message="Loading page..." />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route 
                      path="/" 
                      element={
                        <AdminPanelRoutes>
                          <Layout />
                        </AdminPanelRoutes>
                      }
                    >
                      <Route index element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="suvichar" element={
                        <ProtectedRoute>
                          <Suvichar />
                        </ProtectedRoute>
                      } />
                      <Route path="banners" element={
                        <ProtectedRoute>
                          <Banners />
                        </ProtectedRoute>
                      } />
                      <Route path="audio" element={
                        <ProtectedRoute>
                          <Audio />
                        </ProtectedRoute>
                      } />
                      <Route path="stuti-vinati" element={
                        <ProtectedRoute>
                          <StutiVinati />
                        </ProtectedRoute>
                      } />
                      <Route path="books" element={
                        <ProtectedRoute>
                          <Books />
                        </ProtectedRoute>
                      } />
                      <Route path="notifications" element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      } />
                      <Route path="categories" element={
                        <ProtectedRoute>
                          <Categories />
                        </ProtectedRoute>
                      } />
                      <Route path="users" element={
                        <ProtectedRoute>
                          <Users />
                        </ProtectedRoute>
                      } />
                      <Route path="reports" element={
                        <ProtectedRoute>
                          <Reports />
                        </ProtectedRoute>
                      } />
                      <Route path="settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="playlist" element={
                        <ProtectedRoute>
                          <Playlist />
                        </ProtectedRoute>
                      } />
                      <Route path="support" element={
                        <ProtectedRoute>
                          <Support />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                  </Routes>
                </Suspense>
              </Router>
            </TooltipProvider>
          </AdminPermissionProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;