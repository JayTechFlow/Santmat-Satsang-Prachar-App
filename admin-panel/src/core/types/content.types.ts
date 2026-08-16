// Shared content-domain types used across feature modules.
// Features re-export these from their own types barrel to preserve imports.

export type PublishStatus = 'draft' | 'published' | 'archived';
