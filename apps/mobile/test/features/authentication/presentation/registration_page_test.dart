import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_context.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/google_login_result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/pages/registration_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';
import 'package:santmat_satsang_prachar/shared/widgets/primary_button.dart';

class StubRegisterNotifier extends AuthStateNotifier {
  String? registeredName;
  String? registeredEmail;
  bool registerUserProfileCalled = false;

  @override
  AsyncValue<SessionModel> build() {
    return const AsyncValue.data(SessionModel(isFirstLaunch: false));
  }

  @override
  void beginRegistration() {}

  @override
  void endRegistration() {}

  @override
  Future<GoogleLoginResult> signInWithGoogle() async {
    return const GoogleLoginResult.notRegistered(
      UserEntity(id: 'google_uid_123', email: 'sadhak@santmat.org', displayName: 'Test User', isAnonymous: false),
    );
  }

  @override
  Future<void> registerUserProfile({required String name, String? email}) async {
    registerUserProfileCalled = true;
    registeredName = name;
    registeredEmail = email;
    const user = UserEntity(
      id: 'google_uid_123',
      email: 'sadhak@santmat.org',
      displayName: 'Test User',
      isAnonymous: false,
    );
    state = AsyncValue.data(
      SessionModel(user: user, isFirstLaunch: false),
    );
  }
}

class StubPermissionNotifier extends PermissionContextNotifier {
  @override
  PermissionContext? build() => null;
}

void main() {
  Widget wrap(StubRegisterNotifier notifier) {
    return ProviderScope(
      overrides: [
        authStateProvider.overrideWith(() => notifier),
        permissionContextProvider.overrideWith(() => StubPermissionNotifier()),
      ],
      child: const MaterialApp(home: RegistrationPage()),
    );
  }

  group('RegistrationPage — Google Profile Completion widget contract', () {
    testWidgets('Renders Complete Profile title, Full Name, and Email fields', (tester) async {
      await tester.pumpWidget(wrap(StubRegisterNotifier()));

      expect(find.text('Complete Profile'), findsWidgets);
      expect(find.widgetWithText(TextFormField, 'Full Name'), findsOneWidget);
      expect(find.widgetWithText(TextFormField, 'Email'), findsOneWidget);
      expect(find.text('Already have an account? Sign in'), findsOneWidget);
    });

    testWidgets('Tapping Complete Profile invokes registerUserProfile with form details', (tester) async {
      final notifier = StubRegisterNotifier();
      await tester.pumpWidget(wrap(notifier));

      await tester.enterText(find.widgetWithText(TextFormField, 'Full Name'), 'Swami Sadhak');
      await tester.enterText(find.widgetWithText(TextFormField, 'Email'), 'swami@santmat.org');

      await tester.tap(find.widgetWithText(PrimaryButton, 'Complete Profile'));
      await tester.pump();

      expect(notifier.registerUserProfileCalled, isTrue);
      expect(notifier.registeredName, 'Swami Sadhak');
      expect(notifier.registeredEmail, 'swami@santmat.org');
    });
  });
}