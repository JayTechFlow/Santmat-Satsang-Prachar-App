import { ComingSoon } from '../components/ui/ComingSoon';

export function Reports() {
  return (
    <div className="p-8">
      <h1 className="page-title mb-1">Reports & Analytics</h1>
      <p className="text-muted text-sm mb-8">
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
