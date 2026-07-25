import '../../../../core/utils/result.dart';
import '../entities/user_profile_entity.dart';
import '../entities/user_preference_entity.dart';

abstract class ProfileRepository {
  Future<Result<UserProfileEntity>> getProfile();
  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
  });
  Future<Result<void>> updateProfilePhoto(String photoPath);
  Future<Result<void>> updatePreferences(UserPreferenceEntity preferences);
  Future<Result<void>> logout();
}
