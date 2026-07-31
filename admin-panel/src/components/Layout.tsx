import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useEffect } from 'react';
import { useToast } from '../hooks/useToast';

export function Layout() {
  const { error, success } = useToast();

  useEffect(() => {
    const handleOnline = () => success('You are back online', 5000);
    const handleOffline = () => error('You are currently offline', 0); // 0 means it won't auto dismiss

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, success]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
