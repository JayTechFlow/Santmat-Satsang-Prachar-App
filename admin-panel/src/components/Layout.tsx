import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './ui/Breadcrumb';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import { useLocation } from 'react-router-dom';

export function Layout() {
  const { error, success } = useToast();
  const errorRef = useRef(error);
  const successRef = useRef(success);
  errorRef.current = error;
  successRef.current = success;
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [isTablet, setIsTablet] = useState(() => window.matchMedia('(max-width: 1023px)').matches);
  
  const location = useLocation();
  
  // Scroll to top + focus main on route change
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.scrollTop = 0;
      main.focus();
    }
  }, [location.pathname]);
  
  // Mobile media query
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);
  
  // Tablet media query
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsTablet(e.matches);
      if (!e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);
  
  // Online/offline with refs
  useEffect(() => {
    const handleOnline = () => successRef.current('You are back online', 5000);
    const handleOffline = () => errorRef.current('You are currently offline', 0);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) handleOffline();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Empty deps - refs are stable
  
  // Track focused element before sidebar collapse/expand
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  
  const onToggleSidebar = () => {
    // Preserve focus when collapsing/expanding on desktop
    if (!isMobile && !isTablet) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }
    if (isMobile || isTablet) {
      setMobileOpen(o => !o);
    } else {
      setCollapsed(c => !c);
    }
  };
  
  // Restore focus after sidebar collapse/expand transition
  useEffect(() => {
    if (!isMobile && !isTablet && previousActiveElementRef.current) {
      // Small delay to allow CSS transition to complete
      setTimeout(() => {
        previousActiveElementRef.current?.focus();
        previousActiveElementRef.current = null;
      }, 250);
    }
  }, [collapsed, isMobile, isTablet]);
  
  return (
    <div className={`app-container ${collapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        onCloseMobile={() => setMobileOpen(false)}
        isTablet={isTablet}
      />
      <div className={`main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header collapsed={collapsed} mobileOpen={mobileOpen} onToggleSidebar={onToggleSidebar} isTablet={isTablet} />
        <main id="main-content" className="main-content" tabIndex={-1} role="main">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}