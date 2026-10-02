import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_context.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/google_login_result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/pages/login_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';

class StubLoginNotifier extends AuthStateNotifier {
  bool signInWithGoogleCalled = false;
  GoogleLoginResult resultToReturn = const GoogleLoginResult.success(
    UserEntity(id: 'google_uid_123', email: 'test@example.com', displayName: 'Test User', isAnonymous: false),
  );

  @override
  AsyncValue<SessionModel> build() {
    return const AsyncValue.data(SessionModel(isFirstLaunch: false));
  }

  @override
  Future<GoogleLoginResult> signInWithGoogle() async {
    signInWithGoogleCalled = true;
    return resultToReturn;
  }
}

class StubPermissionNotifier extends PermissionContextNotifier {
  @override
  PermissionContext? build() => null;
}

void main() {
  Widget wrap(StubLoginNotifier notifier) {
    return ProviderScope(
      overrides: [
        authStateProvider.overrideWith(() => notifier),
        permissionContextProvider.overrideWith(() => StubPermissionNotifier()),
      ],
      child: const MaterialApp(home: LoginPage()),
    );
  }

  group('LoginPage — Google Auth widget contract', () {
    testWidgets('Renders Santmat Satsang Prachar title, Welcome back, and Continue with Google button', (tester) async {
      await tester.pumpWidget(wrap(StubLoginNotifier()));

      expect(find.text('Santmat Satsang Prachar'), findsOneWidget);
      expect(find.text('Welcome back'), findsOneWidget);
      expect(find.text('Continue with Google'), findsOneWidget);
      expect(find.text('First time here? Complete Profile'), findsOneWidget);

      // Phone fields and passwords must NOT be present
      expect(find.widgetWithText(TextFormField, '6-digit OTP'), findsNothing);
      expect(find.text('Send OTP'), findsNothing);
    });

    testWidgets('Tapping Continue with Google triggers signInWithGoogle', (tester) async {
      final notifier = StubLoginNotifier();
      await tester.pumpWidget(wrap(notifier));

      await tester.tap(find.text('Continue with Google'));
      await tester.pump();

      expect(notifier.signInWithGoogleCalled, isTrue);
    });
  });
}