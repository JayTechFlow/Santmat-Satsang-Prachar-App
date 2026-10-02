import 'dart:io';
import '../../../../core/utils/result.dart';
import '../entities/user_profile_entity.dart';
import '../entities/user_preference_entity.dart';

abstract class ProfileRepository {
  Future<Result<UserProfileEntity>> getProfile({required String userId});
  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
    String? email,
  });
  Future<Result<String>> uploadProfilePhoto(File imageFile);
  Future<Result<void>> updateProfilePhoto(String? photoPath);
  Future<Result<void>> removeProfilePhoto();
  Future<Result<void>> updatePreferences(UserPreferenceEntity preferences);
  Future<Result<void>> logout();
}
