import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose, ModalContent } from './Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal open={isOpen} onOpenChange={onCancel}>
      <ModalContent className="confirm-dialog" style={{ maxWidth: '400px' }}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalClose onClick={onCancel} />
        </ModalHeader>
        <ModalBody>
          <div className="confirm-dialog-body">
            {isDestructive && (
              <div className="confirm-dialog-icon">
                <AlertTriangle size={24} aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="confirm-dialog-message">{message}</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`} 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmText}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};