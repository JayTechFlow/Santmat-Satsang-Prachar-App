import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_context.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/core/localization/locale_provider.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/phone_login_result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/google_login_result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/pages/splash_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';

class _StubPermissionContextNotifier extends PermissionContextNotifier {
  @override
  PermissionContext? build() => null;
}

/// Minimal stub that implements only the real AuthStateNotifier API.
class MockAuthStateNotifier extends Notifier<AsyncValue<SessionModel>>
    implements AuthStateNotifier {
  @override
  AsyncValue<SessionModel> build() {
    return const AsyncValue.data(SessionModel(isFirstLaunch: false));
  }

  @override
  Future<void> checkSession() async {}

  @override
  Future<void> completeOnboarding() async {}

  @override
  void beginRegistration() {}

  @override
  void endRegistration() {}

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
      Result.failure(Exception('not implemented'));

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
  testWidgets('Splash page shows Hindi title', (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/splash',
      routes: [
        GoRoute(path: '/splash', builder: (context, state) => const SplashPage()),
        GoRoute(path: '/', builder: (context, state) => const Scaffold(body: Text('Home'))),
        GoRoute(path: '/login', builder: (context, state) => const Scaffold(body: Text('Login'))),
      ],
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateProvider.overrideWith(() => MockAuthStateNotifier()),
          permissionContextProvider
              .overrideWith(() => _StubPermissionContextNotifier()),
          localeProvider.overrideWith(() => LocaleNotifier()..state = const Locale('hi')),
        ],
        child: MaterialApp.router(
          routerConfig: router,
        ),
      ),
    );

    expect(find.text('संतमत सत्संग प्रचार'), findsOneWidget);

    // Let the timer and transition complete so no pending timers or errors remain
    await tester.pumpAndSettle(const Duration(seconds: 2));
  });
}
