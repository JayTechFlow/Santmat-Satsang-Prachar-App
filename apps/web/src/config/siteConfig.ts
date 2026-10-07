/**
 * Admin application re-export of the canonical domain configuration.
 *
 * The implementation lives in the shared module so that the public website
 * (apps/website) and the admin dashboard (apps/web) can never disagree about
 * the canonical public URL or the canonical admin URL.
 */
export * from '@shared/siteConfig';
