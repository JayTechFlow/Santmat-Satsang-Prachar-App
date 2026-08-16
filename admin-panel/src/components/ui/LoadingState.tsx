export interface LoadingStateProps {
  variant?: 'inline' | 'button' | 'page' | 'table' | 'overlay';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function LoadingState({
  variant = 'inline',
  message = 'Loading...',
  size = 'md',
  className = '',
  style,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  if (variant === 'page' || variant === 'overlay') {
    return (
      <div
        className={`loading-page-wrapper ${className}`}
        style={variant === 'overlay' ? { position: 'absolute', inset: 0, zIndex: 50 } : undefined}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="loading-page-content">
          <div className={`spinner ${className}`} aria-hidden="true" />
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="loading-table-wrapper" role="status" aria-live="polite" aria-busy="true">
        <div className="loading-table-content">
          <div className={`spinner ${className}`} aria-hidden="true" />
          <p className="loading-message">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <span className="loading-button-content" aria-hidden="true">
        <span className="spinner-button" aria-hidden="true" />
        <span>{message}</span>
      </span>
    );
  }

  return (
    <div className={`loading-inline ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <span className={`spinner ${sizeClasses[size]}`} aria-hidden="true" />
      {message && <span className="loading-message">{message}</span>}
    </div>
  );
}
