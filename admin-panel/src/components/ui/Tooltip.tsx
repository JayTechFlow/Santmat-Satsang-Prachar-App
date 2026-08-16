import React, { forwardRef } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

export const TooltipProvider = ({ children, delayDuration = 200, skipDelayDuration = 300, disableHoverableContent = false }: TooltipProviderProps) => (
  <Tooltip.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} disableHoverableContent={disableHoverableContent}>
    {children}
  </Tooltip.Provider>
);

interface TooltipRootProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  disableHoverableContent?: boolean;
}

export const TooltipRoot = ({ children, open, defaultOpen, onOpenChange, delayDuration, disableHoverableContent }: TooltipRootProps) => (
  <Tooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delayDuration} disableHoverableContent={disableHoverableContent}>
    {children}
  </Tooltip.Root>
);

interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  children: React.ReactElement;
  asChild?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ children, asChild = true, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ref,
      });
    }
    return <Tooltip.Trigger ref={ref} {...props}>{children}</Tooltip.Trigger>;
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  forceMount?: true;
  className?: string;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, side = 'top', align = 'center', sideOffset = 8, alignOffset = 0, forceMount, className = '', style, ...props }, ref) => (
    <Tooltip.Portal>
      <Tooltip.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        forceMount={forceMount}
        className={`tooltip-content ${className}`}
        style={{
          backgroundColor: 'var(--text-heading)',
          color: 'var(--surface)',
          padding: 'var(--space-4) var(--space-8)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 'var(--z-tooltip)',
          ...style,
        }}
        {...props}
      >
        {children}
        <Tooltip.Arrow
          style={{
            fill: 'var(--text-heading)',
          }}
        />
      </Tooltip.Content>
    </Tooltip.Portal>
  )
);

TooltipContent.displayName = 'TooltipContent';

export const TooltipArrow = forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>(
  ({ style, ...props }, ref) => (
    <Tooltip.Arrow
      ref={ref}
      style={{
        fill: 'var(--text-heading)',
        ...style,
      }}
      {...props}
    />
  )
);

TooltipArrow.displayName = 'TooltipArrow';