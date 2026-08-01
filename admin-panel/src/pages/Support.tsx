import { ComingSoon } from '../components/ui/ComingSoon';

export function Support() {
  return (
    <div className="p-8">
      <h1 className="page-title mb-1">Support</h1>
      <p className="text-muted text-sm mb-8">
        Manage user support tickets and feedback.
      </p>
      
      <ComingSoon 
        moduleName="Helpdesk & Support"
        description="A complete ticketing and feedback system is in the works to help you support your mobile app users."
      />
    </div>
  );
}
