import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/providers/profile_providers.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/usecases/profile_usecases.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_profile_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/account_information_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';

// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------

final _fakeProfile = UserProfileEntity(
  id: '123',
  name: 'John',
  statistics: const UserStatisticsEntity(
    downloadCount: 0,
    favoriteCount: 0,
    bookmarkCount: 0,
    totalListeningTime: Duration.zero,
    readingProgressPercentage: 0,
  ),
  preferences: const UserPreferenceEntity(
    languageCode: 'en',
    themeMode: 'system',
    notificationsEnabled: true,
  ),
  accountInfo: AccountInformationEntity(
    memberSince: DateTime.now(),
    applicationVersion: '1.0.0',
  ),
);

class FakeGetProfileUseCase implements GetProfileUseCase {
  int callCount = 0;

  @override
  Future<Result<UserProfileEntity>> call({required String userId}) async {
    callCount++;
    return Result.success(_fakeProfile);
  }
}

final _authenticatedSession = SessionModel(
  user: UserEntity(
    id: 'test_user_123',
    displayName: 'Test User',
    isAnonymous: false,
  ),
  isFirstLaunch: false,
);

const _unauthenticatedSession = SessionModel(isFirstLaunch: false);

/// Auth notifier that starts in an already-authenticated state.
class _AuthenticatedAuthNotifier extends AuthStateNotifier {
  @override
  AsyncValue<SessionModel> build() {
    return AsyncValue.data(_authenticatedSession);
  }

  void setUnauthenticated() {
    state = const AsyncValue.data(_unauthenticatedSession);
  }
}

/// Auth notifier that starts in loading state and can transition.
class _LoadingAuthNotifier extends AuthStateNotifier {
  @override
  AsyncValue<SessionModel> build() {
    return const AsyncValue.loading();
  }

  void authenticate() {
    state = AsyncValue.data(_authenticatedSession);
  }

  void setUnauthenticated() {
    state = const AsyncValue.data(_unauthenticatedSession);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

void main() {
  group('ProfileNotifier auth-profile race fix', () {
    test(
      'auth already authenticated at build → profile loads via microtask',
      () async {
        final fakeGetProfile = FakeGetProfileUseCase();

        final container = ProviderContainer(
          overrides: [
            getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
            authStateProvider.overrideWith(
              () => _AuthenticatedAuthNotifier(),
            ),
          ],
        );
        addTearDown(container.dispose);

        // Initial state is loading (microtask hasn't run yet)
        final initial = container.read(profileStateProvider);
        expect(initial.isLoading, true);

        // Pump the microtask queue so loadProfile() executes
        await Future.delayed(Duration.zero);

        final data = container.read(profileStateProvider);
        expect(data.hasValue, true);
        expect(data.value?.name, 'John');
        expect(fakeGetProfile.callCount, 1);
      },
    );

    test(
      'auth loading → then authenticated → profile loads via rebuild',
      () async {
        final fakeGetProfile = FakeGetProfileUseCase();
        late _LoadingAuthNotifier authNotifier;

        final container = ProviderContainer(
          overrides: [
            getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
            authStateProvider.overrideWith(() {
              authNotifier = _LoadingAuthNotifier();
              return authNotifier;
            }),
          ],
        );
        addTearDown(container.dispose);

        // Listen to profile state updates
        final states = <AsyncValue<UserProfileEntity>>[];
        container.listen(
          profileStateProvider,
          (previous, next) => states.add(next),
          fireImmediately: true,
        );
        await Future.delayed(Duration.zero);

        expect(container.read(profileStateProvider).isLoading, true);
        expect(fakeGetProfile.callCount, 0);

        authNotifier.authenticate();
        await Future.delayed(Duration.zero);
        await Future.delayed(Duration.zero);

        final data = container.read(profileStateProvider);
        expect(data.hasValue, true);
        expect(data.value?.name, 'John');
        expect(fakeGetProfile.callCount, 1);
      },
    );

    test(
      'logout → profile cleared to error state',
      () async {
        final fakeGetProfile = FakeGetProfileUseCase();
        late _AuthenticatedAuthNotifier authNotifier;

        final container = ProviderContainer(
          overrides: [
            getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
            authStateProvider.overrideWith(() {
              authNotifier = _AuthenticatedAuthNotifier();
              return authNotifier;
            }),
          ],
        );
        addTearDown(container.dispose);

        // Wait for profile to load
        container.read(profileStateProvider);
        await Future.delayed(Duration.zero);
        expect(container.read(profileStateProvider).hasValue, true);

        // Simulate logout: auth transitions to unauthenticated
        authNotifier.setUnauthenticated();
        await Future.delayed(Duration.zero);

        final state = container.read(profileStateProvider);
        expect(state.hasError, true);
        expect(state.error.toString(), contains('User not authenticated'));
      },
    );
  });
}
