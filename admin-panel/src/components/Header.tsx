import { Menu, Bell, User, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const name = path.substring(1);
    return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }}>
          <Menu size={24} color="var(--text-heading)" />
        </button>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{getPageTitle()}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Calendar size={18} />
          <span style={{ fontSize: '0.875rem' }}>Today, 27 Jul</span>
        </div>
        
        <button className="btn btn-outline" style={{ border: 'none', padding: '0.5rem', position: 'relative' }}>
          <Bell size={24} color="var(--text-heading)" />
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '6px', 
            width: '8px', 
            height: '8px', 
            backgroundColor: 'var(--danger)', 
            borderRadius: '50%' 
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Admin User</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Super Admin</p>
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: '#FFEDD5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
