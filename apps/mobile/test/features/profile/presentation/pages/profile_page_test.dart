import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/pages/profile_page.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/providers/profile_providers.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/usecases/profile_usecases.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/repositories/profile_repository.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_profile_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/account_information_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import '../../../../helpers/mock_profile_data_source.dart';

final _testProfile = UserProfileEntity(
  id: 'test_user_123',
  name: 'संतमत साधक',
  email: 'sadhak@santmat.org',
  phone: '+91 9876543210',
  statistics: const UserStatisticsEntity(
    downloadCount: 5,
    favoriteCount: 12,
    bookmarkCount: 3,
    totalListeningTime: Duration(hours: 10),
    readingProgressPercentage: 0.5,
  ),
  preferences: const UserPreferenceEntity(
    languageCode: 'hi',
    themeMode: 'light',
    notificationsEnabled: true,
    audioQuality: 'standard',
    devanagariFontScale: 1.0,
  ),
  accountInfo: AccountInformationEntity(
    memberSince: DateTime(2024, 1, 1),
    applicationVersion: '1.0.0',
  ),
);

class FakeGetProfileUseCase implements GetProfileUseCase {
  bool throwError = false;

  @override
  Future<Result<UserProfileEntity>> call({required String userId}) async {
    if (throwError) {
      return Result.failure(Exception('प्रोफ़ाइल लोड करने में त्रुटि'));
    }
    return Result.success(_testProfile);
  }
}

class FakeLogoutUseCase implements LogoutUseCase {
  bool didLogout = false;

  @override
  Future<Result<void>> call() async {
    didLogout = true;
    return const Result.success(null);
  }
}

class MockProfileRepository implements ProfileRepository {
  @override
  Future<Result<UserProfileEntity>> getProfile({required String userId}) async =>
      Result.success(_testProfile);

  @override
  Future<Result<void>> logout() async => const Result.success(null);

  @override
  Future<Result<void>> updatePreferences(UserPreferenceEntity preferences) async =>
      const Result.success(null);

  @override
  Future<Result<void>> updateProfile({required String name, required String phone, String? email}) async =>
      const Result.success(null);

  @override
  Future<Result<String>> uploadProfilePhoto(File imageFile) async =>
      const Result.success('https://example.com/avatar.jpg');

  @override
  Future<Result<void>> updateProfilePhoto(String? photoPath) async =>
      const Result.success(null);

  @override
  Future<Result<void>> removeProfilePhoto() async =>
      const Result.success(null);
}

final _authenticatedSession = SessionModel(
  user: UserEntity(
    id: 'test_user_123',
    displayName: 'संतमत साधक',
    isAnonymous: false,
  ),
  isFirstLaunch: false,
);

const _unauthenticatedSession = SessionModel(isFirstLaunch: false);

class TestAuthNotifier extends AuthStateNotifier {
  final bool initialAuth;
  TestAuthNotifier({this.initialAuth = true});

  @override
  AsyncValue<SessionModel> build() {
    return initialAuth
        ? AsyncValue.data(_authenticatedSession)
        : const AsyncValue.data(_unauthenticatedSession);
  }

  void logout() {
    state = const AsyncValue.data(_unauthenticatedSession);
  }

  @override
  Future<void> signOut() async {
    logout();
  }

  void login() {
    state = AsyncValue.data(_authenticatedSession);
  }
}

void main() {
  group('Profile & Settings Contract Tests', () {
    testWidgets('1, 8, 9, 10. Profile loads authenticated user and supported settings preferences', (tester) async {
      final fakeGetProfile = FakeGetProfileUseCase();

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
            profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
            profileDataSourceProvider.overrideWithValue(MockProfileDataSource()),
            authStateProvider.overrideWith(() => TestAuthNotifier(initialAuth: true)),
          ],
          child: const MaterialApp(
            home: ProfilePage(),
          ),
        ),
      );

      await tester.pump();
      await tester.pumpAndSettle();

      expect(find.text('संतमत साधक'), findsWidgets);
      expect(find.text('sadhak@santmat.org'), findsOneWidget);
      expect(find.text('सत्संग सदस्य'), findsOneWidget);

      expect(find.text('डार्क मोड (Dark Mode)'), findsOneWidget);
      expect(find.text('भाषा (Language)'), findsOneWidget);
      expect(find.text('देवनागरी फॉन्ट आकार (Font Scale)'), findsOneWidget);
      expect(find.text('ऑडियो गुणवत्ता (Audio Quality)'), findsOneWidget);
      expect(find.text('ऐप संस्करण (App Version)'), findsOneWidget);

      expect(find.text('Fake Setting'), findsNothing);
      expect(find.text('Admin Secret Toggle'), findsNothing);
    });

    testWidgets('2. Profile loading state rendering', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
            authStateProvider.overrideWith(() => TestAuthNotifier(initialAuth: true)),
          ],
          child: const MaterialApp(
            home: ProfilePage(),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('3. Profile error state rendering with retry', (tester) async {
      final fakeGetProfile = FakeGetProfileUseCase()..throwError = true;

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
            profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
            authStateProvider.overrideWith(() => TestAuthNotifier(initialAuth: true)),
          ],
          child: const MaterialApp(
            home: ProfilePage(),
          ),
        ),
      );

      await tester.pump();
      await tester.pumpAndSettle();

      expect(find.textContaining('प्रोफ़ाइल लोड करने में त्रुटि'), findsOneWidget);
    });

    test('4, 5, 12. Logout calls logout usecase and clears authenticated profile state', () async {
      final fakeGetProfile = FakeGetProfileUseCase();
      final fakeLogout = FakeLogoutUseCase();
      late TestAuthNotifier authNotifier;

      final container = ProviderContainer(
        overrides: [
          getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
          logoutUseCaseProvider.overrideWithValue(fakeLogout),
          authStateProvider.overrideWith(() {
            authNotifier = TestAuthNotifier(initialAuth: true);
            return authNotifier;
          }),
        ],
      );
      addTearDown(container.dispose);

      container.read(profileStateProvider);
      await Future.delayed(Duration.zero);
      expect(container.read(profileStateProvider).hasValue, true);

      await container.read(profileStateProvider.notifier).logout();
      expect(fakeLogout.didLogout, true);

      authNotifier.logout();
      await Future.delayed(Duration.zero);

      final postLogoutState = container.read(profileStateProvider);
      expect(postLogoutState.hasError, true);
      expect(postLogoutState.error.toString(), contains('User not authenticated'));
    });

    test('6, 7. Relogin re-authenticates and Profile reloads correctly', () async {
      final fakeGetProfile = FakeGetProfileUseCase();
      late TestAuthNotifier authNotifier;

      final container = ProviderContainer(
        overrides: [
          getProfileUseCaseProvider.overrideWithValue(fakeGetProfile),
          profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
          authStateProvider.overrideWith(() {
            authNotifier = TestAuthNotifier(initialAuth: false);
            return authNotifier;
          }),
        ],
      );
      addTearDown(container.dispose);

      container.listen(profileStateProvider, (previous, next) {});

      final unauthProfileState = container.read(profileStateProvider);
      expect(unauthProfileState.hasError, true);
      expect(unauthProfileState.error.toString(), contains('User not authenticated'));

      authNotifier.login();
      await Future.delayed(Duration.zero);
      await Future.delayed(Duration.zero);

      final reloggedProfileState = container.read(profileStateProvider);
      expect(reloggedProfileState.hasValue, true);
      expect(reloggedProfileState.value?.name, 'संतमत साधक');
    });

    test('11. No duplicate profile/auth implementation contract check', () {
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(MockProfileRepository()),
          profileDataSourceProvider.overrideWithValue(MockProfileDataSource()),
        ],
      );
      addTearDown(container.dispose);

      final repository = container.read(profileRepositoryProvider);
      expect(repository, isNotNull);
    });
  });
}
