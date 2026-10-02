import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white shadow-xs hover:shadow-sm',
  secondary:
    'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100 active:bg-stone-200 shadow-xs',
  tertiary:
    'bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300',
  destructive:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs',
  ghost:
    'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-[0.625rem] gap-1.5',
  md: 'px-4 py-2.5 text-xs rounded-[0.625rem] gap-2',
  lg: 'px-5 py-3 text-sm rounded-[0.625rem] gap-2',
};

const DISABLED_STYLES = 'disabled:opacity-45 disabled:pointer-events-none';

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  loadingText,
  fullWidth = false,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold transition-all select-none cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C]/40 focus-visible:ring-offset-1 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${DISABLED_STYLES} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};