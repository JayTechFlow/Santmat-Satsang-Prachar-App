import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Layout & Components
import { Layout } from './components/Layout';

import { lazy, Suspense } from 'react';

// Pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Suvichar = lazy(() => import('./pages/Suvichar').then(m => ({ default: m.Suvichar })));
const Banners = lazy(() => import('./pages/Banners').then(m => ({ default: m.Banners })));
const Audio = lazy(() => import('./pages/Audio').then(m => ({ default: m.Audio })));
const StutiVinati = lazy(() => import('./pages/StutiVinati').then(m => ({ default: m.StutiVinati })));
const Books = lazy(() => import('./pages/Books').then(m => ({ default: m.Books })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const ComponentsTest = lazy(() => import('./pages/ComponentsTest').then(m => ({ default: m.ComponentsTest })));

import { ToastProvider } from './components/ui/ToastProvider';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>Loading...</div>;
  }

  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>Loading page...</div>}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            
            {/* Remove auth requirement for components test so it can be viewed easily during dev */}
            <Route path="/components-test" element={<ComponentsTest />} />

            <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
              <Route index element={<Dashboard />} />
              <Route path="suvichar" element={<Suvichar />} />
              <Route path="banners" element={<Banners />} />
              <Route path="audio" element={<Audio />} />
              <Route path="stuti-vinati" element={<StutiVinati />} />
              <Route path="books" element={<Books />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="categories" element={<Categories />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
}

export default App;
