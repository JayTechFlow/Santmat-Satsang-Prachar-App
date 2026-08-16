import '../../../../core/utils/result.dart';
import '../entities/user_profile_entity.dart';
import '../entities/user_preference_entity.dart';
import '../repositories/profile_repository.dart';

class GetProfileUseCase {
  final ProfileRepository _repository;

  GetProfileUseCase(this._repository);

  Future<Result<UserProfileEntity>> call() {
    return _repository.getProfile();
  }
}

class UpdateProfileUseCase {
  final ProfileRepository _repository;

  UpdateProfileUseCase(this._repository);

  Future<Result<void>> call({required String name, required String phone}) {
    return _repository.updateProfile(name: name, phone: phone);
  }
}

class UpdateProfilePhotoUseCase {
  final ProfileRepository _repository;

  UpdateProfilePhotoUseCase(this._repository);

  Future<Result<void>> call(String photoPath) {
    return _repository.updateProfilePhoto(photoPath);
  }
}

class UpdatePreferencesUseCase {
  final ProfileRepository _repository;

  UpdatePreferencesUseCase(this._repository);

  Future<Result<void>> call(UserPreferenceEntity preferences) {
    return _repository.updatePreferences(preferences);
  }
}

class LogoutUseCase {
  final ProfileRepository _repository;

  LogoutUseCase(this._repository);

  Future<Result<void>> call() {
    return _repository.logout();
  }
}
