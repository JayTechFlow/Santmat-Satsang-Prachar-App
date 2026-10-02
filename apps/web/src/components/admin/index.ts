/**
 * ============================================================================
 * Santmat Satsang Prachar — Canonical Admin Component System
 * ============================================================================
 * Centralized export for all reusable enterprise admin UI primitives.
 * Follows Phase 2 & 3 architectural guidelines.
 */

export * from './AdminPageHeader';
export * from './AdminCard';
export * from './AdminSection';
export * from './AdminField';
export * from './AdminDeleteDialog';
export * from './AdminSaveBar';
export * from './AdminAspectRatioPreview';
export * from './AdminImageCropper';
export * from './AdminUploadField';

// Aliased Canonical UI Primitives from ../ui/
export { Button as AdminButton } from '../ui/Button';
export type { ButtonProps as AdminButtonProps, ButtonVariant as AdminButtonVariant, ButtonSize as AdminButtonSize } from '../ui/Button';
export { DataTable as AdminTable } from '../ui/DataTable';
export type { Column as AdminTableColumn } from '../ui/DataTable';
export { SearchBar as AdminSearchBar } from '../ui/SearchBar';
export { FilterBar as AdminFilterBar } from '../ui/FilterBar';
export type { FilterOption as AdminFilterOption } from '../ui/FilterBar';
export { Pagination as AdminPagination } from '../ui/Pagination';
export { StatusBadge as AdminStatusBadge } from '../ui/StatusBadge';
export { EmptyState as AdminEmptyState } from '../ui/EmptyState';
export { ErrorState as AdminErrorState } from '../ui/ErrorState';
export { LoadingOverlay as AdminLoadingOverlay } from '../ui/LoadingOverlay';
export { ConfirmDialog as AdminConfirmDialog } from '../ui/ConfirmDialog';
export { Modal as AdminModal } from '../ui/Modal';
export { ModalHeader as AdminModalHeader } from '../ui/Modal';
export { ModalTitle as AdminModalTitle } from '../ui/Modal';
export { ModalClose as AdminModalClose } from '../ui/Modal';
export { ModalBody as AdminModalBody } from '../ui/Modal';
export { ModalFooter as AdminModalFooter } from '../ui/Modal';
export { ModalContent as AdminModalContent } from '../ui/Modal';
