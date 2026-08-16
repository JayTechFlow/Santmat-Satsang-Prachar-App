import React, { forwardRef } from 'react';
import { NavLink as RRNavLink, useLocation } from 'react-router-dom';
import { Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';

interface NavLinkProps {
  to: string;
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | true;
  className?: string;
  collapsed?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
  'data-nav-index'?: number;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      to,
      label,
      icon: Icon,
      isActive: isActiveProp,
      disabled,
      onClick,
      'aria-current': ariaCurrent,
      className,
      collapsed = false,
      onKeyDown,
      'data-nav-index': navIndex,
    },
    ref
  ) => {
    const location = useLocation();
    const isPrefixActive = location.pathname.startsWith(to + '/') || location.pathname === to;
    const isActive = isActiveProp ?? isPrefixActive;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
      onKeyDown?.(e);
    };

    const linkContent = (
      <>
        {Icon && <Icon size={collapsed ? 24 : 20} aria-hidden="true" />}
        {!collapsed && <span className="nav-link-label">{label}</span>}
      </>
    );

    const tooltipContent = collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <RRNavLink
            ref={ref}
            to={to}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-current={isActive ? (ariaCurrent ?? 'page') : undefined}
            aria-label={label}
            className={`nav-link ${isActive ? 'active' : ''} ${className ?? ''}`}
            data-nav-index={navIndex}
          >
            {linkContent}
          </RRNavLink>
        </TooltipTrigger>
        <TooltipContent side="right" align="center" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    ) : (
      <RRNavLink
        ref={ref}
        to={to}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-current={isActive ? (ariaCurrent ?? 'page') : undefined}
        className={`nav-link ${isActive ? 'active' : ''} ${className ?? ''}`}
        data-nav-index={navIndex}
      >
        {linkContent}
      </RRNavLink>
    );

    return <>{tooltipContent}</>;
  }
);

NavLink.displayName = 'NavLink';