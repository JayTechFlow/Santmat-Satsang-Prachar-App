import React, { forwardRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onOpenChange, defaultOpen, children, className, ...props }, ref) => {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay" />
          <Dialog.Content
            ref={ref}
            className={`modal-content ${className || ''}`}
            {...props}
          >
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

Modal.displayName = 'Modal';

interface ModalTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export const ModalTrigger = forwardRef<HTMLButtonElement, ModalTriggerProps>(
  ({ children, asChild = true, ...props }, ref) => {
    if (asChild) {
      return <Dialog.Trigger asChild={true} {...props} ref={ref}>{children}</Dialog.Trigger>;
    }
    return <Dialog.Trigger {...props} ref={ref}>{children}</Dialog.Trigger>;
  }
);

ModalTrigger.displayName = 'ModalTrigger';

interface ModalCloseProps {
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ModalClose = forwardRef<HTMLButtonElement, ModalCloseProps>(
  ({ children, className = '', asChild = false, onClick, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        ref,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
        },
      });
    }
    return (
      <Dialog.Close
        ref={ref}
        className={`btn-icon ${className}`}
        aria-label="Close"
        onClick={onClick}
        {...props}
      >
        {children || <X size={20} />}
      </Dialog.Close>
    );
  }
);

ModalClose.displayName = 'ModalClose';

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`modal-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-24)',
        borderBottom: '1px solid var(--border)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

ModalHeader.displayName = 'ModalHeader';

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ children, className = '', style, ...props }, ref) => (
    <h3
      ref={ref}
      className={`modal-title ${className}`}
      style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--text-heading)',
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  )
);

ModalTitle.displayName = 'ModalTitle';

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ children, className = '', style, ...props }, ref) => (
    <p
      ref={ref}
      className={`modal-description ${className}`}
      style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        margin: 'var(--space-8) 0 0',
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  )
);

ModalDescription.displayName = 'ModalDescription';

interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`modal-body ${className}`}
      style={{
        padding: 'var(--space-24)',
        overflow: 'auto',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

ModalBody.displayName = 'ModalBody';

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`modal-footer ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--space-16)',
        padding: 'var(--space-16) var(--space-24)',
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

ModalFooter.displayName = 'ModalFooter';

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`modal-content-wrapper ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-float)',
        border: '1px solid var(--border)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);

ModalContent.displayName = 'ModalContent';