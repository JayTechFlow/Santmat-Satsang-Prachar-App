import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from './Modal';

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
  confirmText = 'पुष्टि करें',
  cancelText = 'रद्द करें',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal open={isOpen} onOpenChange={onCancel}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalClose onClick={onCancel} />
      </ModalHeader>
      <ModalBody>
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-2xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-stone-700 leading-relaxed">{message}</p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-colors ${
            isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
          }`}
          onClick={() => {
            onConfirm();
            onCancel();
          }}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};
