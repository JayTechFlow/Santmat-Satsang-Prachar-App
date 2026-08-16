import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_profile_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/account_information_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/repositories/profile_repository.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/usecases/profile_usecases.dart';

class MockProfileRepository implements ProfileRepository {
  UserProfileEntity mockProfile = UserProfileEntity(
    id: '123',
    name: 'Test',
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

  @override
  Future<Result<UserProfileEntity>> getProfile() async =>
      Result.success(mockProfile);

  @override
  Future<Result<void>> logout() async => const Result.success(null);

  @override
  Future<Result<void>> updatePreferences(
    UserPreferenceEntity preferences,
  ) async => const Result.success(null);

  @override
  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
  }) async => const Result.success(null);

  @override
  Future<Result<void>> updateProfilePhoto(String photoPath) async =>
      const Result.success(null);
}

void main() {
  late MockProfileRepository repository;
  late GetProfileUseCase getProfileUseCase;
  late UpdateProfileUseCase updateProfileUseCase;

  setUp(() {
    repository = MockProfileRepository();
    getProfileUseCase = GetProfileUseCase(repository);
    updateProfileUseCase = UpdateProfileUseCase(repository);
  });

  test('should return profile from repository', () async {
    final result = await getProfileUseCase();
    expect(result.isSuccess, true);
    expect(result.data?.name, 'Test');
  });

  test('should update profile via repository', () async {
    final result = await updateProfileUseCase(name: 'New', phone: '1234');
    expect(result.isSuccess, true);
  });
}
