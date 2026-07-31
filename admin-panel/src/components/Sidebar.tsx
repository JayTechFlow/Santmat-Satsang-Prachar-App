import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music,
  BookOpen, 
  Tags,
  Users,
  ListVideo,
  Bell, 
  Image as ImageIcon, 
  BarChart,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/banners', label: 'Banners', icon: ImageIcon },
  { path: '/categories', label: 'Categories', icon: Tags },
  { path: '/suvichar', label: 'Suvichar', icon: BookOpen },
  { path: '/books', label: 'Books', icon: BookOpen },
  { path: '/audio', label: 'Audio / Bhajans', icon: Music },
  { path: '/stuti-vinati', label: 'Stuti & Vinati', icon: BookOpen },
  { path: '/playlist', label: 'Playlists', icon: ListVideo },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart },
  { path: '/settings', label: 'App Settings', icon: Settings },
  { path: '/support', label: 'Support', icon: HelpCircle },
];

export function Sidebar() {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--primary)', lineHeight: 1.2 }}>
          Santmat Satsang Prachar
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Admin Panel</p>
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
      <button 
        onClick={handleLogout} 
        className="btn" 
        style={{ 
          marginTop: '1rem',
          justifyContent: 'flex-start', 
          padding: '0.75rem 1rem', 
          background: 'transparent', 
          color: 'var(--danger)',
          width: '100%'
        }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}
