import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../authentication/presentation/providers/auth_providers.dart';
import '../../data/datasources/mock_profile_data_source.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/usecases/profile_usecases.dart';
import 'profile_notifier.dart';
import 'profile_state.dart';

final mockProfileDataSourceProvider = Provider<MockProfileDataSource>((ref) {
  return MockProfileDataSource();
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(
    ref.watch(mockProfileDataSourceProvider),
    ref.watch(authRepositoryProvider),
  );
});

final getProfileUseCaseProvider = Provider<GetProfileUseCase>((ref) {
  return GetProfileUseCase(ref.watch(profileRepositoryProvider));
});

final updateProfileUseCaseProvider = Provider<UpdateProfileUseCase>((ref) {
  return UpdateProfileUseCase(ref.watch(profileRepositoryProvider));
});

final updateProfilePhotoUseCaseProvider = Provider<UpdateProfilePhotoUseCase>((
  ref,
) {
  return UpdateProfilePhotoUseCase(ref.watch(profileRepositoryProvider));
});

final updatePreferencesUseCaseProvider = Provider<UpdatePreferencesUseCase>((
  ref,
) {
  return UpdatePreferencesUseCase(ref.watch(profileRepositoryProvider));
});

final logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  return LogoutUseCase(ref.watch(profileRepositoryProvider));
});

final profileStateProvider = NotifierProvider<ProfileNotifier, ProfileState>(
  () {
    return ProfileNotifier();
  },
);
