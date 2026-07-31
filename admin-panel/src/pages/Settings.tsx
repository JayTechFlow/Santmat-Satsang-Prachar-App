import { ComingSoon } from '../components/ui/ComingSoon';

export function Settings() {
  return (
    <div className="p-8">
      <h1 className="page-title mb-1">App Settings</h1>
      <p className="text-muted text-sm mb-8">
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
