import '../../domain/entities/user_profile_entity.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/user_statistics_entity.dart';
import '../../domain/entities/account_information_entity.dart';

import 'profile_data_source.dart';

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

  Future<UserProfileEntity> getProfile() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _mockProfile;
  }

  Future<void> updateProfile({
    required String name,
    required String phone,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _mockProfile = _mockProfile.copyWith(name: name, phone: phone);
  }

  Future<void> updateProfilePhoto(String photoPath) async {
    await Future.delayed(const Duration(milliseconds: 800));
    _mockProfile = _mockProfile.copyWith(
      photoUrl: photoPath,
    ); // Mock local change
  }

  Future<void> updatePreferences(UserPreferenceEntity preferences) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _mockProfile = _mockProfile.copyWith(preferences: preferences);
  }
}
