/**
 * ============================================================================
 * Santmat Satsang Prachar — Canonical Admin Component System
 * ============================================================================
 * Centralized export for all reusable enterprise admin UI primitives.
 * Follows Phase 2 & 3 architectural guidelines.
 */

export * from './AdminPageHeader';
export * from './AdminCard';
export * from './AdminField';
export * from './AdminDeleteDialog';
export * from './AdminAspectRatioPreview';
export * from './AdminImageCropper';
export * from './AdminUploadField';

// Aliased Canonical UI Primitives from ../ui/
export { Button as AdminButton } from '../ui/Button';
export { ConfirmDialog as AdminConfirmDialog } from '../ui/ConfirmDialog';
export { Modal as AdminModal } from '../ui/Modal';
export { ModalHeader as AdminModalHeader } from '../ui/Modal';
export { ModalTitle as AdminModalTitle } from '../ui/Modal';
export { ModalClose as AdminModalClose } from '../ui/Modal';
export { ModalBody as AdminModalBody } from '../ui/Modal';
export { ModalFooter as AdminModalFooter } from '../ui/Modal';
