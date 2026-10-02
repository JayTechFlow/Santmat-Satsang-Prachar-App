import '../auth/permission_engine.dart';

/// Temporary Development Direct-Entry Configuration
/// Disables the authentication gate ONLY during UI/UX construction.
/// All real authentication infrastructure (Firebase Auth, RBAC, Tokens, Sessions) is PRESERVED.
class DevEntryConfig {
  const DevEntryConfig._();

  /// Deterministic DEVELOPMENT-ONLY presentation context for previewing mobile UI components
  static final PermissionContext devPermissionContext = createPermissionContext({
    'uid': 'dev-ui-preview',
    'displayName': 'UI Preview User',
    'organizationId': 'org_santmat_global',
    'role': 'mobile_user',
    'permissions': [
      'mobile.audio',
      'mobile.stuti',
      'mobile.books',
      'mobile.library',
      'mobile.profile',
      'mobile.favorites',
      'mobile.history',
      'mobile.notifications',
      'mobile.search',
      'mobile.events',
      'mobile.settings',
    ],
  });
}
