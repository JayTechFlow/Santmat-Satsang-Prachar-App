import 'dart:io';
import '../../../../core/utils/result.dart';
import '../../../../core/services/firebase_storage_service.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../../authentication/domain/repositories/auth_repository.dart';
import '../datasources/profile_data_source.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileDataSource _dataSource;
  final AuthRepository _authRepository;
  final FirebaseStorageService _storageService;

  ProfileRepositoryImpl(
    this._dataSource,
    this._authRepository, [
    FirebaseStorageService? storageService,
  ]) : _storageService = storageService ?? FirebaseStorageService();

  String get _userId => _authRepository.currentUserId ?? '';

  @override
  Future<Result<UserProfileEntity>> getProfile({required String userId}) async {
    try {
      final profile = await _dataSource.getProfile(userId: userId);

      // Extract legitimate Google profile data from currentUser
      final authUser = _authRepository.currentUser;
      final googlePhoto = authUser?.photoUrl;
      final authEmail = authUser?.email;
      final authName = authUser?.displayName;

      final merged = profile.copyWith(
        // Retain user's custom application profile name if set; fallback to Google displayName
        name: profile.name.trim().isNotEmpty
            ? profile.name
            : ((authName != null && authName.trim().isNotEmpty) ? authName : 'सत्संग प्रेमी'),
        email: (profile.email != null && profile.email!.trim().isNotEmpty)
            ? profile.email
            : authEmail,
        googlePhotoUrl: googlePhoto,
        // photoUrl reflects effective photo: custom photo first, then Google photo
        photoUrl: (profile.customPhotoUrl != null && profile.customPhotoUrl!.trim().isNotEmpty)
            ? profile.customPhotoUrl
            : ((googlePhoto != null && googlePhoto.trim().isNotEmpty)
                ? googlePhoto
                : profile.photoUrl),
      );

      return Result.success(merged);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
    String? email,
  }) async {
    try {
      await _dataSource.updateProfile(
        userId: _userId,
        name: name,
        phone: phone,
        email: email,
      );
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<String>> uploadProfilePhoto(File imageFile) async {
    try {
      if (_userId.isEmpty) {
        return Result.failure(Exception('User not authenticated'));
      }
      // Canonical user-scoped storage path: avatars/{uid}/avatar_{timestamp}.jpg
      final fileName = 'avatar_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final storagePath = 'avatars/$_userId/$fileName';

      final downloadUrl = await _storageService.uploadFile(storagePath, imageFile);
      await _dataSource.updateProfilePhoto(
        userId: _userId,
        photoPath: downloadUrl,
      );
      return Result.success(downloadUrl);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> updateProfilePhoto(String? photoPath) async {
    try {
      await _dataSource.updateProfilePhoto(
        userId: _userId,
        photoPath: photoPath,
      );
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> removeProfilePhoto() async {
    try {
      if (_userId.isEmpty) {
        return Result.failure(Exception('User not authenticated'));
      }
      await _dataSource.updateProfilePhoto(
        userId: _userId,
        photoPath: null,
      );
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
      await _dataSource.updatePreferences(
        userId: _userId,
        preferences: preferences,
      );
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
