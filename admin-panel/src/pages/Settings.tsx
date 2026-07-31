import { ComingSoon } from '../components/ui/ComingSoon';

export function Settings() {
  return (
    <div style={{ padding: 'var(--space-32)' }}>
      <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>App Settings</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-32)' }}>
        Configure global application settings and preferences.
      </p>
      
      <ComingSoon 
        moduleName="System Configuration"
        description="Global settings management is under development. Soon you'll be able to configure app-wide variables and metadata."
        expectedAvailability="Late 2026"
      />
    </div>
  );
}
