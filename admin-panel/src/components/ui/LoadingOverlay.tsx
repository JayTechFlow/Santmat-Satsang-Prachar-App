import { Loader2 } from 'lucide-react';

export const LoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 size={32} color="var(--primary)" className="loading-spinner" aria-hidden="true" />
      {message && (
        <span className="loading-overlay-message">
          {message}
        </span>
      )}
    </div>
  );
};