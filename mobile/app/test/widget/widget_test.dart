import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';

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
  Future<void> signInAnonymously() async {}
  @override
  Future<void> signInWithGoogle() async {}
  @override
  Future<void> signOut() async {}
}

void main() {
  testWidgets('App renders Santmat Satsang Prachar', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateProvider.overrideWith(() => MockAuthStateNotifier()),
        ],
        child: const App(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Login'), findsOneWidget);
  });
}
