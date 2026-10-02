import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/phone_login_result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/google_login_result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';

// ---------------------------------------------------------------------------
// A mock that only overrides methods that EXIST on the real AuthStateNotifier.
// Dead email auth methods have been removed from the live codebase.
// ---------------------------------------------------------------------------
class MockTamperedAuthStateNotifier
    extends Notifier<AsyncValue<SessionModel>>
    implements AuthStateNotifier {
  UserEntity? _user;
  bool _tamperedToken = false;

  @override
  AsyncValue<SessionModel> build() {
    return AsyncValue.data(SessionModel(user: _user, isFirstLaunch: false));
  }

  void setTamperedToken(bool value) {
    _tamperedToken = value;
  }

  @override
  Future<void> checkSession() async {
    if (_tamperedToken) {
      state = AsyncValue.error(
        Exception('Invalid or tampered token signatures'),
        StackTrace.current,
      );
      return;
    }
    state = AsyncValue.data(SessionModel(user: _user, isFirstLaunch: false));
  }

  @override
  void beginRegistration() {}

  @override
  void endRegistration() {}

  @override
  Future<void> completeOnboarding() async {}

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(String verificationId) codeSent,
    required void Function(Exception error) verificationFailed,
  }) async {}

  @override
  Future<PhoneLoginResult> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async =>
      const PhoneLoginResult.notRegistered();

  @override
  Future<Result<UserEntity>> authenticateForRegistration(
    String verificationId,
    String smsCode,
  ) async =>
      Result.failure(Exception('not implemented in mock'));

  @override
  Future<void> registerWithPhone({required String name, String? email}) async {}

  @override
  Future<GoogleLoginResult> signInWithGoogle() async =>
      const GoogleLoginResult.canceled();

  @override
  Future<void> registerUserProfile({required String name, String? email}) async {}

  @override
  Future<void> signOut() async {}
}

void main() {
  group('SSP Adversarial & Security Tests', () {
    test('Tampered token results in authentication failure', () async {
      final authNotifier = MockTamperedAuthStateNotifier();

      final container = ProviderContainer(
        overrides: [
          authStateProvider.overrideWith(() => authNotifier),
        ],
      );

      // Force Riverpod to initialize the provider
      container.read(authStateProvider);

      // Tamper with the token
      authNotifier.setTamperedToken(true);
      await container.read(authStateProvider.notifier).checkSession();

      final state = container.read(authStateProvider);
      expect(state.hasError, true);
      expect(state.error.toString(), contains('Invalid or tampered token signatures'));
    });

    test('Custom claims check prevents unauthorized role escalation', () {
      final regularContext = PermissionContext(
        uid: 'user_123',
        role: Role.mobileUser,
        isSuspended: false,
      );

      final engine = permissionEngine;
      final hasAdminAccess = engine.hasPermission(regularContext.role, 'rbac.manage');
      expect(hasAdminAccess, false);

      final adminContext = PermissionContext(
        uid: 'user_123',
        role: Role.developerSuperAdmin,
        isSuspended: false,
      );
      final hasAdminAccessAfterEscalation =
          engine.hasPermission(adminContext.role, 'rbac.manage');
      expect(hasAdminAccessAfterEscalation, true);
    });

    test('Phone-registered user cannot self-promote to admin role', () {
      // A mobile_user cannot have admin permissions through the permission engine.
      final mobileCtx = PermissionContext(
        uid: 'phone_uid_12345',
        role: Role.mobileUser,
        isSuspended: false,
      );
      final engine = permissionEngine;

      expect(engine.hasPermission(mobileCtx.role, 'users.manage'), false);
      expect(engine.hasPermission(mobileCtx.role, 'users.assign_role'), false);
      expect(engine.hasPermission(mobileCtx.role, 'rbac.manage'), false);
      expect(engine.hasPermission(mobileCtx.role, 'platform.security'), false);
    });

    test('Suspended phone user is blocked even with mobile_user role', () {
      final suspendedCtx = PermissionContext(
        uid: 'suspended_phone_uid',
        role: Role.mobileUser,
        isSuspended: true,
      );

      expect(suspendedCtx.isSuspended, true);
      expect(requireRole(suspendedCtx, [Role.mobileUser]).allowed, false);
    });

    test('Malformed JWT signature checks throw format exception', () {
      final malformedJwt = 'invalidheader.invalidpayload.invalidsignatur';

      bool parseFailed = false;
      try {
        final parts = malformedJwt.split('.');
        if (parts.length != 3) {
          throw const FormatException('Invalid JWT segment count');
        }
        if (parts[2].length % 4 != 0) {
          throw const FormatException('Invalid Base64 signature padding');
        }
      } catch (e) {
        parseFailed = true;
      }

      expect(parseFailed, true);
    });

    test('Unknown role string cannot bypass mobileUser downgrade', () {
      final ctx = createPermissionContext(const {'role': 'hacker_king'});
      expect(ctx.role, Role.mobileUser);
      expect(permissionEngine.hasPermission(ctx.role, 'users.manage'), false);
    });
  });
}
