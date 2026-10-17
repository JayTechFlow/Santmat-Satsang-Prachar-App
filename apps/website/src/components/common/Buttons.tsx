import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  icon,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:ring-offset-2';

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${className}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  icon,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold border border-stone-300 shadow-xs transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:ring-offset-2';

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {icon}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${className}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
};
