import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_profile_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/account_information_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/data/datasources/profile_data_source.dart';

class MockProfileDataSource implements ProfileDataSource {
  UserProfileEntity _mockProfile = UserProfileEntity(
    id: 'user_123',
    name: 'Santmat Devotee',
    email: 'devotee@example.com',
    phone: '+91 9876543210',
    photoUrl: 'https://i.pravatar.cc/150?u=devotee',
    statistics: const UserStatisticsEntity(
      downloadCount: 15,
      favoriteCount: 42,
      bookmarkCount: 8,
      totalListeningTime: Duration(hours: 45, minutes: 30),
      readingProgressPercentage: 0.65,
    ),
    preferences: const UserPreferenceEntity(
      languageCode: 'en',
      themeMode: 'system',
      notificationsEnabled: true,
    ),
    accountInfo: AccountInformationEntity(
      memberSince: DateTime(2023, 5, 15),
      applicationVersion: '1.0.0 (42)',
    ),
  );

  @override
  Future<UserProfileEntity> getProfile({required String userId}) async {
    return _mockProfile;
  }

  @override
  Future<void> updateProfile({
    required String userId,
    required String name,
    required String phone,
    String? email,
  }) async {
    _mockProfile = _mockProfile.copyWith(
      name: name,
      phone: phone,
      email: email ?? _mockProfile.email,
    );
  }

  @override
  Future<void> updateProfilePhoto({
    required String userId,
    required String? photoPath,
  }) async {
    _mockProfile = _mockProfile.copyWith(
      photoUrl: photoPath,
      customPhotoUrl: photoPath,
    );
  }

  @override
  Future<void> updatePreferences({
    required String userId,
    required UserPreferenceEntity preferences,
  }) async {
    _mockProfile = _mockProfile.copyWith(preferences: preferences);
  }
}
