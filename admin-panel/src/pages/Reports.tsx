import { ComingSoon } from '../components/ui/ComingSoon';

export function Reports() {
  return (
    <div style={{ padding: 'var(--space-32)' }}>
      <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Reports & Analytics</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-32)' }}>
        View system usage, engagement, and operational metrics.
      </p>
      
      <ComingSoon 
        moduleName="Advanced Reports"
        description="We are currently building comprehensive analytics and reporting dashboards to help you monitor system engagement."
        expectedAvailability="Q4 2026"
      />
    </div>
  );
}
