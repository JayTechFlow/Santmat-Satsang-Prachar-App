import { Loader2 } from 'lucide-react';

export const LoadingOverlay = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'blur(2px)'
    }}>
      <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {message && (
        <span style={{ marginTop: 'var(--space-16)', fontWeight: 600, color: 'var(--text-heading)' }}>
          {message}
        </span>
      )}
    </div>
  );
};
