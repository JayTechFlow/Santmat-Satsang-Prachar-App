import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/home_dashboard_entity.dart';
import 'package:santmat_satsang_prachar/features/home/domain/usecases/home_usecases.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/providers/home_providers.dart';

import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';

class MockAuthStateNotifier extends Notifier<AsyncValue<SessionModel>>
    implements AuthStateNotifier {
  @override
  AsyncValue<SessionModel> build() {
    // Authenticated so it goes to Home
    return const AsyncValue.data(
      SessionModel(
        isFirstLaunch: false,
        user: UserEntity(id: '123', isAnonymous: true),
      ),
    );
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

class MockGetHomeDashboardUseCase extends GetHomeDashboardUseCase {
  MockGetHomeDashboardUseCase(super.repository);

  @override
  Future<Result<HomeDashboardEntity>> call() async {
    return const Result.success(
      HomeDashboardEntity(
        notificationCount: 0,
        banners: [],
        quickActions: [],
        latestSatsangs: [],
        upcomingEvents: [],
        latestAudios: [],
        featuredBooks: [],
      ),
    );
  }
}

void main() {
  testWidgets('HomePage renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateProvider.overrideWith(() => MockAuthStateNotifier()),
          getHomeDashboardUseCaseProvider.overrideWith(
            (ref) =>
                MockGetHomeDashboardUseCase(ref.read(homeRepositoryProvider)),
          ),
        ],
        child: const App(),
      ),
    );

    // Initial load and redirect to home
    await tester.pumpAndSettle();

    // Verify app bar is rendered
    expect(find.byType(AppBar), findsOneWidget);

    // Verify custom sections rendered (since list is empty, GreetingCard should be there)
    expect(find.textContaining('जय गुरुदेव'), findsOneWidget);
  });
}
