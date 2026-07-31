import { ComingSoon } from '../components/ui/ComingSoon';

export function Support() {
  return (
    <div style={{ padding: 'var(--space-32)' }}>
      <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Support</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-32)' }}>
        Manage user support tickets and feedback.
      </p>
      
      <ComingSoon 
        moduleName="Helpdesk & Support"
        description="A complete ticketing and feedback system is in the works to help you support your mobile app users."
      />
    </div>
  );
}
