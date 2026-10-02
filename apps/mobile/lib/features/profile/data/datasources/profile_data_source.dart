import '../../domain/entities/user_profile_entity.dart';
import '../../domain/entities/user_preference_entity.dart';

abstract class ProfileDataSource {
  Future<UserProfileEntity> getProfile({required String userId});
  Future<void> updateProfile({
    required String userId,
    required String name,
    required String phone,
    String? email,
  });
  Future<void> updateProfilePhoto({
    required String userId,
    required String? photoPath,
  });
  Future<void> updatePreferences({
    required String userId,
    required UserPreferenceEntity preferences,
  });
}
