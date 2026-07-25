import '../../../../core/utils/result.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../../authentication/domain/repositories/auth_repository.dart';
import '../datasources/mock_profile_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final MockProfileDataSource _dataSource;
  final AuthRepository _authRepository;

  ProfileRepositoryImpl(this._dataSource, this._authRepository);

  @override
  Future<Result<UserProfileEntity>> getProfile() async {
    try {
      final profile = await _dataSource.getProfile();
      return Result.success(profile);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
  }) async {
    try {
      await _dataSource.updateProfile(name: name, phone: phone);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateProfilePhoto(String photoPath) async {
    try {
      await _dataSource.updateProfilePhoto(photoPath);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updatePreferences(
    UserPreferenceEntity preferences,
  ) async {
    try {
      await _dataSource.updatePreferences(preferences);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> logout() async {
    try {
      await _authRepository.signOut();
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
