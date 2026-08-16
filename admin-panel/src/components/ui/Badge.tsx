import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { AlertCircle, Archive, Ban, CheckCircle, Clock, XCircle } from 'lucide-react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--surface-hover)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  },
  primary: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid rgba(232, 116, 18, 0.25)',
  },
  success: {
    backgroundColor: 'var(--success-light)',
    color: 'var(--success)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
  },
  warning: {
    backgroundColor: 'var(--warning-light)',
    color: 'var(--warning)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
  },
  danger: {
    backgroundColor: 'var(--danger-light)',
    color: 'var(--danger)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  info: {
    backgroundColor: 'var(--info-light)',
    color: 'var(--info)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
  },
  neutral: {
    backgroundColor: 'var(--surface-hover)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    padding: '2px 6px',
    fontSize: '0.625rem',
    borderRadius: 'var(--radius-full)',
  },
  md: {
    padding: '2px 8px',
    fontSize: '0.75rem',
    borderRadius: 'var(--radius-full)',
  },
  lg: {
    padding: '4px 12px',
    fontSize: '0.875rem',
    borderRadius: 'var(--radius-full)',
  },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', children, className = '', asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        ref={ref}
        className={`badge ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontWeight: 600,
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'success',
  published: 'success',
  sent: 'success',
  pending: 'warning',
  processing: 'warning',
  uploading: 'warning',
  draft: 'neutral',
  scheduled: 'info',
  deleted: 'danger',
  error: 'danger',
  failed: 'danger',
  expired: 'danger',
  suspended: 'danger',
  archived: 'neutral',
  inactive: 'neutral',
};

const statusIconMap: Record<string, React.ReactNode> = {
  active: <CheckCircle size={14} aria-hidden="true" />,
  completed: <CheckCircle size={14} aria-hidden="true" />,
  published: <CheckCircle size={14} aria-hidden="true" />,
  sent: <CheckCircle size={14} aria-hidden="true" />,
  pending: <Clock size={14} aria-hidden="true" />,
  processing: <Clock size={14} aria-hidden="true" />,
  uploading: <Clock size={14} aria-hidden="true" />,
  scheduled: <Clock size={14} aria-hidden="true" />,
  draft: <AlertCircle size={14} aria-hidden="true" />,
  error: <XCircle size={14} aria-hidden="true" />,
  failed: <XCircle size={14} aria-hidden="true" />,
  expired: <XCircle size={14} aria-hidden="true" />,
  suspended: <Ban size={14} aria-hidden="true" />,
  archived: <Archive size={14} aria-hidden="true" />,
  inactive: <AlertCircle size={14} aria-hidden="true" />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  className = '',
}) => {
  const key = status.toLowerCase();
  const resolvedVariant = variant || statusVariantMap[key] || 'default';
  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const icon = statusIconMap[key];

  return (
    <Badge variant={resolvedVariant} size={size} className={className}>
      {icon ? <span style={{ display: 'inline-flex', marginRight: 'var(--space-4)' }}>{icon}</span> : null}
      {label}
    </Badge>
  );
};