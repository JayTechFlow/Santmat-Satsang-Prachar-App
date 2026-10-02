import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image/image.dart' as img;
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_profile_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/account_information_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/repositories/profile_repository.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/providers/profile_providers.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/services/profile_image_service.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/widgets/profile_avatar.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/widgets/profile_font_scale_tile.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/pages/edit_profile_page.dart';
import 'package:santmat_satsang_prachar/features/authentication/presentation/providers/auth_state_provider.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';

UserProfileEntity _createTestProfile({
  String id = 'u1',
  String name = 'संतोष कुमार',
  String? email,
  String? phone,
  String? customPhotoUrl,
  String? googlePhotoUrl,
  String? photoUrl,
}) {
  return UserProfileEntity(
    id: id,
    name: name,
    email: email,
    phone: phone,
    customPhotoUrl: customPhotoUrl,
    googlePhotoUrl: googlePhotoUrl,
    photoUrl: photoUrl,
    statistics: const UserStatisticsEntity(
      downloadCount: 0,
      favoriteCount: 0,
      bookmarkCount: 0,
      totalListeningTime: Duration.zero,
      readingProgressPercentage: 0,
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
}

class _FakeProfileRepo implements ProfileRepository {
  UserProfileEntity currentProfile;
  _FakeProfileRepo(this.currentProfile);

  @override
  Future<Result<UserProfileEntity>> getProfile({required String userId}) async =>
      Result.success(currentProfile);

  @override
  Future<Result<void>> logout() async => const Result.success(null);

  @override
  Future<Result<void>> removeProfilePhoto() async {
    currentProfile = currentProfile.copyWith(
      clearCustomPhotoUrl: true,
      photoUrl: currentProfile.googlePhotoUrl,
    );
    return const Result.success(null);
  }

  @override
  Future<Result<void>> updatePreferences(UserPreferenceEntity preferences) async {
    currentProfile = currentProfile.copyWith(preferences: preferences);
    return const Result.success(null);
  }

  @override
  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
    String? email,
  }) async {
    currentProfile = currentProfile.copyWith(
      name: name,
      phone: phone,
      email: email,
    );
    return const Result.success(null);
  }

  @override
  Future<Result<void>> updateProfilePhoto(String? photoPath) async {
    currentProfile = currentProfile.copyWith(
      photoUrl: photoPath,
      customPhotoUrl: photoPath,
    );
    return const Result.success(null);
  }

  @override
  Future<Result<String>> uploadProfilePhoto(File imageFile) async {
    const downloadUrl = 'https://storage.googleapis.com/avatars/user123/new_avatar.jpg';
    currentProfile = currentProfile.copyWith(
      customPhotoUrl: downloadUrl,
      photoUrl: downloadUrl,
    );
    return Result.success(downloadUrl);
  }
}

class _TestAuthNotifier extends AuthStateNotifier {
  @override
  AsyncValue<SessionModel> build() {
    return AsyncValue.data(
      const SessionModel(
        user: UserEntity(
          id: 'test_user',
          displayName: 'Test Devotee',
          email: 'test@santmat.org',
          isAnonymous: false,
        ),
        isFirstLaunch: false,
      ),
    );
  }
}

void main() {
  group('UserProfileEntity — Photo Priority & Fallback Hierarchy', () {
    test('1. Custom photo takes precedence over Google photo', () {
      final profile = _createTestProfile(
        name: 'संतोष कुमार',
        customPhotoUrl: 'https://storage.santmat.org/custom.jpg',
        googlePhotoUrl: 'https://lh3.googleusercontent.com/google.jpg',
      );

      expect(profile.hasCustomPhoto, true);
      expect(profile.hasGooglePhoto, true);
      expect(profile.resolvedPhotoUrl, 'https://storage.santmat.org/custom.jpg');
    });

    test('2. Google photo takes precedence when custom photo is absent', () {
      final profile = _createTestProfile(
        name: 'संतोष कुमार',
        customPhotoUrl: null,
        googlePhotoUrl: 'https://lh3.googleusercontent.com/google.jpg',
      );

      expect(profile.hasCustomPhoto, false);
      expect(profile.hasGooglePhoto, true);
      expect(profile.resolvedPhotoUrl, 'https://lh3.googleusercontent.com/google.jpg');
    });

    test('3. Returns null photoUrl and generates initials when no photo exists', () {
      final profile = _createTestProfile(
        name: 'संतोष कुमार',
      );

      expect(profile.hasCustomPhoto, false);
      expect(profile.hasGooglePhoto, false);
      expect(profile.resolvedPhotoUrl, isNull);
      expect(profile.initials, 'स');
    });

    test('4. Latin name initials generation', () {
      final profile = _createTestProfile(
        name: 'Santmat Devotee',
      );

      expect(profile.initials, 'S');
    });

    test('5. Empty name fallback initial is default Hindi character', () {
      final profile = _createTestProfile(
        name: '',
      );

      expect(profile.initials, 'सा');
    });
  });

  group('ProfileNotifier — Custom Upload & Removal State Flows', () {
    late UserProfileEntity baseProfile;

    setUp(() {
      baseProfile = UserProfileEntity(
        id: 'test_user',
        name: 'संतोष कुमार',
        email: 'santosh@santmat.org',
        phone: '+919876543210',
        googlePhotoUrl: 'https://lh3.googleusercontent.com/google_photo.jpg',
        statistics: const UserStatisticsEntity(
          downloadCount: 3,
          favoriteCount: 7,
          bookmarkCount: 2,
          totalListeningTime: Duration(hours: 5),
          readingProgressPercentage: 0.4,
        ),
        preferences: const UserPreferenceEntity(
          languageCode: 'hi',
          themeMode: 'light',
          notificationsEnabled: true,
          audioQuality: 'high',
          devanagariFontScale: 1.1,
        ),
        accountInfo: AccountInformationEntity(
          memberSince: DateTime(2024, 1, 1),
          applicationVersion: '1.0.0',
        ),
      );
    });

    test('Upload custom photo replaces state with custom photo URL', () async {
      final fakeRepo = _FakeProfileRepo(baseProfile);
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(fakeRepo),
          authStateProvider.overrideWith(() => _TestAuthNotifier()),
        ],
      );
      addTearDown(container.dispose);

      container.read(profileStateProvider);
      await Future.delayed(Duration.zero);

      final tempDir = Directory.systemTemp.createTempSync();
      final testFile = File('${tempDir.path}/test_avatar.jpg')..writeAsBytesSync([1, 2, 3]);

      final result = await container.read(profileStateProvider.notifier).uploadProfilePhoto(testFile);
      expect(result.isSuccess, true);
      expect(result.data, 'https://storage.googleapis.com/avatars/user123/new_avatar.jpg');

      final state = container.read(profileStateProvider);
      expect(state.value?.customPhotoUrl, 'https://storage.googleapis.com/avatars/user123/new_avatar.jpg');
      expect(state.value?.resolvedPhotoUrl, 'https://storage.googleapis.com/avatars/user123/new_avatar.jpg');

      tempDir.deleteSync(recursive: true);
    });

    test('Remove custom photo resets to Google account photo fallback', () async {
      final profileWithCustom = baseProfile.copyWith(
        customPhotoUrl: 'https://storage.santmat.org/custom.jpg',
      );
      final fakeRepo = _FakeProfileRepo(profileWithCustom);
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(fakeRepo),
          authStateProvider.overrideWith(() => _TestAuthNotifier()),
        ],
      );
      addTearDown(container.dispose);

      container.read(profileStateProvider);
      await Future.delayed(Duration.zero);

      final removeResult = await container.read(profileStateProvider.notifier).removeProfilePhoto();
      expect(removeResult.isSuccess, true);

      final state = container.read(profileStateProvider);
      expect(state.value?.customPhotoUrl, isNull);
      expect(state.value?.resolvedPhotoUrl, 'https://lh3.googleusercontent.com/google_photo.jpg');
    });

    test('Update preferences persists font scale and theme', () async {
      final fakeRepo = _FakeProfileRepo(baseProfile);
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(fakeRepo),
          authStateProvider.overrideWith(() => _TestAuthNotifier()),
        ],
      );
      addTearDown(container.dispose);

      container.read(profileStateProvider);
      await Future.delayed(Duration.zero);

      final newPrefs = baseProfile.preferences.copyWith(
        themeMode: 'dark',
        devanagariFontScale: 1.3,
      );

      final result = await container.read(profileStateProvider.notifier).updatePreferences(newPrefs);
      expect(result.isSuccess, true);

      final state = container.read(profileStateProvider);
      expect(state.value?.preferences.themeMode, 'dark');
      expect(state.value?.preferences.devanagariFontScale, 1.3);
    });
  });

  group('ProfileImageService — Optimization & 1:1 Square Output Contract', () {
    test('Center crop & 256x256 resizing produces square JPEG', () {
      // Create a 800x400 non-square raw image
      final original = img.Image(width: 800, height: 400);
      img.fill(original, color: img.ColorRgb8(200, 100, 50));
      final rawJpg = img.encodeJpg(original);

      final optimized = ProfileImageService.optimizeImageBytes(
        rawBytes: rawJpg,
        targetSize: 256,
        quality: 85,
      );

      expect(optimized, isNotNull);
      final decoded = img.decodeJpg(optimized);
      expect(decoded, isNotNull);
      expect(decoded!.width, 256);
      expect(decoded.height, 256);
      // Size should be well below 5MB (under 50KB for 256x256)
      expect(optimized.lengthInBytes, lessThan(100 * 1024));
    });
  });

  group('Profile Widget Tests', () {
    testWidgets('ProfileAvatar renders initials container when photoUrl is null', (tester) async {
      final profile = _createTestProfile(
        name: 'संतमत साधक',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProfileAvatar(
              profile: profile,
              size: 80,
              isEditable: true,
            ),
          ),
        ),
      );

      expect(find.text('स'), findsOneWidget);
      expect(find.byIcon(Icons.camera_alt_rounded), findsOneWidget);
    });

    testWidgets('ProfileFontScaleTile renders slider and percentage badge', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: ProfileFontScaleTile(),
            ),
          ),
        ),
      );

      expect(find.text('देवनागरी फॉन्ट आकार (Font Scale)'), findsOneWidget);
      expect(find.byType(Slider), findsOneWidget);
      expect(find.textContaining('100%'), findsOneWidget);
      expect(find.text('॥ जय गुरुदेव ॥ (Devanagari Preview)'), findsOneWidget);
    });

    testWidgets('EditProfilePage validates required name and email format', (tester) async {
      final profile = _createTestProfile(
        id: 'test_user',
        name: 'संतमत साधक',
        email: 'sadhak@santmat.org',
        phone: '+919876543210',
      );
      final fakeRepo = _FakeProfileRepo(profile);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            profileRepositoryProvider.overrideWithValue(fakeRepo),
            authStateProvider.overrideWith(() => _TestAuthNotifier()),
          ],
          child: const MaterialApp(
            home: EditProfilePage(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.widgetWithText(TextFormField, 'संतमत साधक'), findsOneWidget);

      // Clear name and enter invalid email
      final nameField = find.widgetWithText(TextFormField, 'संतमत साधक');
      await tester.enterText(nameField, '');

      final emailField = find.widgetWithText(TextFormField, 'sadhak@santmat.org');
      await tester.enterText(emailField, 'invalid-email-format');

      await tester.ensureVisible(find.text('सहेजें (Save Changes)'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('सहेजें (Save Changes)'));
      await tester.pumpAndSettle();

      expect(find.text('कृपया अपना नाम दर्ज करें (Name is required)'), findsOneWidget);
      expect(find.text('कृपया एक वैध ईमेल पता दर्ज करें (Valid email required)'), findsOneWidget);
    });
  });
}
