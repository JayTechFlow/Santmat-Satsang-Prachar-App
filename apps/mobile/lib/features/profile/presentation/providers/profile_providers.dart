import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/profile_usecases.dart';
import 'profile_notifier.dart';
import 'profile_state.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final getProfileUseCaseProvider = Provider<GetProfileUseCase>((ref) {
  return GetProfileUseCase(ref.watch(profileRepositoryProvider));
});

final updateProfileUseCaseProvider = Provider<UpdateProfileUseCase>((ref) {
  return UpdateProfileUseCase(ref.watch(profileRepositoryProvider));
});

final uploadProfilePhotoUseCaseProvider =
    Provider<UploadProfilePhotoUseCase>((ref) {
  return UploadProfilePhotoUseCase(ref.watch(profileRepositoryProvider));
});

final removeProfilePhotoUseCaseProvider =
    Provider<RemoveProfilePhotoUseCase>((ref) {
  return RemoveProfilePhotoUseCase(ref.watch(profileRepositoryProvider));
});

final updateProfilePhotoUseCaseProvider =
    Provider<UpdateProfilePhotoUseCase>((ref) {
  return UpdateProfilePhotoUseCase(ref.watch(profileRepositoryProvider));
});

final updatePreferencesUseCaseProvider =
    Provider<UpdatePreferencesUseCase>((ref) {
  return UpdatePreferencesUseCase(ref.watch(profileRepositoryProvider));
});

final logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  return LogoutUseCase(ref.watch(profileRepositoryProvider));
});

final profileStateProvider =
    NotifierProvider<ProfileNotifier, ProfileState>(() {
  return ProfileNotifier();
});
