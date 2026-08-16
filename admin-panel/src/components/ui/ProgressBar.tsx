import React, { forwardRef } from 'react';

type ProgressSize = 'sm' | 'md' | 'lg';
type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

interface ProgressBarProps extends React.ComponentPropsWithoutRef<'div'> {
  value: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  className?: string;
  'aria-label'?: string;
  'aria-valuetext'?: string;
}

const sizeStyles: Record<ProgressSize, React.CSSProperties> = {
  sm: { height: 4 },
  md: { height: 8 },
  lg: { height: 12 },
};

const variantStyles: Record<ProgressVariant, React.CSSProperties> = {
  default: { backgroundColor: 'var(--primary)' },
  success: { backgroundColor: 'var(--success)' },
  warning: { backgroundColor: 'var(--warning)' },
  danger: { backgroundColor: 'var(--danger)' },
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, size = 'md', variant = 'default', showLabel = false, label, className = '', style, 'aria-label': ariaLabel, 'aria-valuetext': ariaValueText, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const ariaValue = Math.round(percentage);

    return (
      <div
        ref={ref}
        className={`progress-bar ${className}`}
        role="progressbar"
        aria-valuenow={ariaValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText || `${ariaValue}%`}
        style={{
          width: '100%',
          backgroundColor: 'var(--border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          ...style,
        }}
        {...props}
      >
        <div
          className="progress-bar-fill"
          style={{
            height: '100%',
            width: `${percentage}%`,
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-normal) var(--easing-standard)',
            ...variantStyles[variant],
            ...sizeStyles[size],
          }}
        />
        {showLabel && (
          <span className="progress-bar-label" style={{
            position: 'absolute',
            right: 0,
            top: -20,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            {label || `${ariaValue}%`}
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

interface CircularProgressProps extends React.ComponentPropsWithoutRef<'svg'> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
  ({ value, max = 100, size = 48, strokeWidth = 4, variant = 'default', className = '', 'aria-label': ariaLabel, style, ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  const variantColors: Record<ProgressVariant, string> = {
    default: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  };

  return (
    <svg
      ref={ref}
      className={`circular-progress ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      style={{
        transform: 'rotate(-90deg)',
        ...style,
      }}
      {...props}
    >
      <circle
        className="circular-progress-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        className="circular-progress-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={variantColors[variant]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{
          transition: 'stroke-dashoffset var(--transition-normal) var(--easing-standard)',
        }}
      />
    </svg>
  );
  }
);

CircularProgress.displayName = 'CircularProgress';

CircularProgress.displayName = 'CircularProgress';