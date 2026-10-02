import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_state_provider.dart';
import '../../domain/entities/auth_status.dart';
import '../../domain/entities/session_model.dart';
import '../../../../core/auth/permission_context.dart';

/// Provider that maps the SessionModel auth state to the higher‑level AuthStatus enum.
final authStatusProvider = Provider<AuthStatus>((ref) {
  final asyncSession = ref.watch(authStateProvider);
  final permissionContext = ref.watch(permissionContextProvider);
  
  return asyncSession.when(
    data: (SessionModel session) {
      if (!session.isAuthenticated) {
        return AuthStatus.unauthenticated;
      }
      // Check for suspended/deactivated accounts via permission context
      if (permissionContext?.isSuspended == true) {
        return AuthStatus.suspended;
      }
      return AuthStatus.authenticated;
    },
    loading: () => AuthStatus.bootstrapping,
    error: (_, __) => AuthStatus.error,
  );
});
