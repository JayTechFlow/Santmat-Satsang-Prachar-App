import React, { forwardRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  dir?: 'ltr' | 'rtl';
}

export const DropdownMenuRoot = ({ children, open, defaultOpen, onOpenChange, modal = false, dir = 'ltr' }: DropdownMenuProps) => (
  <DropdownMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal} dir={dir}>
    {children}
  </DropdownMenu.Root>
);

interface DropdownMenuTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className = '', asChild = false, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ref,
      });
    }
    return (
      <DropdownMenu.Trigger
        ref={ref}
        className={`dropdown-menu-trigger ${className}`}
        {...props}
      >
        {children}
      </DropdownMenu.Trigger>
    );
  }
);

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
  forceMount?: true;
}

export const DropdownMenuPortal = ({ children, container, forceMount }: DropdownMenuPortalProps) => (
  <DropdownMenu.Portal container={container} forceMount={forceMount}>
    {children}
  </DropdownMenu.Portal>
);

interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
  sticky?: 'partial' | 'always';
  hideWhenDetached?: boolean;
  className?: string;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, side = 'bottom', align = 'start', sideOffset = 4, alignOffset = 0, avoidCollisions = true, collisionPadding = 8, sticky = 'partial', hideWhenDetached = false, className = '', style, ...props }, ref) => (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionPadding={collisionPadding}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        className={`dropdown-menu-content ${className}`}
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-4)',
          minWidth: '180px',
          zIndex: 'var(--z-dropdown)',
          ...style,
        }}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  )
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = ({ children, disabled = false, inset = false, shortcut, className = '', style, ...props }: any) => (
  <DropdownMenu.Item
    disabled={disabled}
    inset={inset}
    className={`dropdown-menu-item ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: 'var(--space-8) var(--space-12)',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: disabled ? 'var(--text-muted)' : 'var(--text-heading)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'background var(--duration-fast) var(--easing-standard)',
      opacity: disabled ? 0.5 : 1,
      textAlign: 'left',
      ...style,
    }}
    {...props}
  >
    <span style={{ flex: 1 }}>{children}</span>
    {shortcut && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'var(--space-12)' }}>{shortcut}</span>}
  </DropdownMenu.Item>
);

export const DropdownMenuCheckboxItem = ({ children, checked = false, disabled = false, onCheckedChange, className = '', style, ...props }: any) => (
  <DropdownMenu.CheckboxItem
    checked={checked}
    disabled={disabled}
    onCheckedChange={onCheckedChange}
    className={`dropdown-menu-checkbox-item ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: 'var(--space-8) var(--space-12)',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: disabled ? 'var(--text-muted)' : 'var(--text-heading)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'background var(--duration-fast) var(--easing-standard)',
      opacity: disabled ? 0.5 : 1,
      textAlign: 'left',
      ...style,
    }}
    {...props}
  >
    <DropdownMenu.ItemIndicator style={{ marginRight: 'var(--space-8)', color: 'var(--primary)' }}>
      <Check size={16} />
    </DropdownMenu.ItemIndicator>
    <span style={{ flex: 1 }}>{children}</span>
  </DropdownMenu.CheckboxItem>
);

interface DropdownMenuRadioGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const DropdownMenuRadioGroup = forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  ({ children, value, onValueChange, className = '', style, ...props }, ref) => (
    <DropdownMenu.RadioGroup
      ref={ref}
      value={value}
      onValueChange={onValueChange}
      className={`dropdown-menu-radio-group ${className}`}
      style={style}
      {...props}
    >
      {children}
    </DropdownMenu.RadioGroup>
  )
);

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

export const DropdownMenuRadioItem = ({ children, value, checked = false, disabled = false, onCheckedChange, className = '', style, ...props }: any) => (
  <DropdownMenu.RadioItem
    value={value}
    checked={checked}
    disabled={disabled}
    onCheckedChange={onCheckedChange}
    className={`dropdown-menu-radio-item ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: 'var(--space-8) var(--space-12)',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: disabled ? 'var(--text-muted)' : 'var(--text-heading)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'background var(--duration-fast) var(--easing-standard)',
      opacity: disabled ? 0.5 : 1,
      textAlign: 'left',
      ...style,
    }}
    {...props}
  >
    <DropdownMenu.ItemIndicator style={{ marginRight: 'var(--space-8)', color: 'var(--primary)' }}>
      <Check size={16} />
    </DropdownMenu.ItemIndicator>
    <span style={{ flex: 1 }}>{children}</span>
  </DropdownMenu.RadioItem>
);

export const DropdownMenuSubTrigger = ({ children, disabled = false, inset = false, className = '', style, ...props }: any) => (
  <DropdownMenu.SubTrigger
    disabled={disabled}
    inset={inset}
    className={`dropdown-menu-sub-trigger ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: 'var(--space-8) var(--space-12)',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: disabled ? 'var(--text-muted)' : 'var(--text-heading)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'background var(--duration-fast) var(--easing-standard)',
      opacity: disabled ? 0.5 : 1,
      textAlign: 'left',
      ...style,
    }}
    {...props}
  >
    <span style={{ flex: 1 }}>{children}</span>
    <ChevronRight size={16} color="var(--text-muted)" />
  </DropdownMenu.SubTrigger>
);

export const DropdownMenuSubContent = ({ children, side = 'right', align = 'start', sideOffset = 4, alignOffset = 0, avoidCollisions = true, collisionPadding = 8, sticky = 'partial', hideWhenDetached = false, className = '', style, ...props }: any) => (
  <DropdownMenu.Portal>
    <DropdownMenu.SubContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      avoidCollisions={avoidCollisions}
      collisionPadding={collisionPadding}
      sticky={sticky}
      hideWhenDetached={hideWhenDetached}
      className={`dropdown-menu-sub-content ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-4)',
        minWidth: '180px',
        zIndex: 'var(--z-dropdown)',
        ...style,
      }}
      {...props}
    >
      {children}
    </DropdownMenu.SubContent>
  </DropdownMenu.Portal>
);

export const DropdownMenuSeparator = ({ className = '', style, ...props }: any) => (
  <DropdownMenu.Separator
    className={`dropdown-menu-separator ${className}`}
    style={{
      height: 1,
      backgroundColor: 'var(--border)',
      margin: 'var(--space-4) 0',
      ...style,
    }}
    {...props}
  />
);

export const DropdownMenuLabel = ({ children, className = '', style, ...props }: any) => (
  <DropdownMenu.Label
    className={`dropdown-menu-label ${className}`}
    style={{
      padding: 'var(--space-8) var(--space-12)',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      ...style,
    }}
    {...props}
  >
    {children}
  </DropdownMenu.Label>
);

export const DropdownMenuArrow = ({ className = '', style, ...props }: any) => (
  <DropdownMenu.Arrow
    className={`dropdown-menu-arrow ${className}`}
    style={{
      fill: 'var(--surface)',
      stroke: 'var(--border)',
      strokeWidth: 1,
      ...style,
    }}
    {...props}
  />
);