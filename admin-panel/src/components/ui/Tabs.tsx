import React, { forwardRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

type TabsOrientation = 'horizontal' | 'vertical';
type TabsActivationMode = 'automatic' | 'manual';

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  dir?: 'ltr' | 'rtl';
  style?: React.CSSProperties;
}

export const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, children, className = '', orientation = 'horizontal', activationMode = 'automatic', dir = 'ltr', style, ...props }, ref) => (
    <Tabs.Root
      ref={ref}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      activationMode={activationMode}
      dir={dir}
      className={`tabs-root ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Tabs.Root>
  )
);

TabsRoot.displayName = 'TabsRoot';

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className = '', style, loop, ...props }, ref) => (
    <Tabs.List
      ref={ref}
      className={`tabs-list ${className}`}
      loop={loop}
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--background)',
        padding: '0 var(--space-24)',
        ...style,
      }}
      {...props}
    >
      {children}
    </Tabs.List>
  )
);

TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ children, value, disabled = false, className = '', style, ...props }, ref) => (
    <Tabs.Trigger
      ref={ref}
      value={value}
      disabled={disabled}
      className={`tabs-trigger ${className}`}
      style={{
        borderRadius: 0,
        borderBottom: '2px solid transparent',
        padding: 'var(--space-12) var(--space-16)',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--text-muted)',
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tabs.Trigger>
  )
);

TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  forceMount?: true;
  style?: React.CSSProperties;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, value, className = '', forceMount, style, ...props }, ref) => (
    <Tabs.Content
      ref={ref}
      value={value}
      forceMount={forceMount}
      className={`tabs-content ${className}`}
      style={{
        padding: 'var(--space-24)',
        overflow: 'auto',
        ...style,
      }}
      {...props}
    >
      {children}
    </Tabs.Content>
  )
);

TabsContent.displayName = 'TabsContent';