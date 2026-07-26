import '../../domain/entities/user_profile_entity.dart';
import '../../domain/entities/user_preference_entity.dart';

abstract class ProfileDataSource {
  Future<UserProfileEntity> getProfile();
  Future<void> updateProfile({required String name, required String phone});
  Future<void> updateProfilePhoto(String photoPath);
  Future<void> updatePreferences(UserPreferenceEntity preferences);
}
