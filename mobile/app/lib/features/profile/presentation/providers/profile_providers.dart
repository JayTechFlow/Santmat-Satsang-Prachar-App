import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/di/service_locator_registrations.dart';
import '../../../authentication/presentation/providers/auth_providers.dart';
import '../../data/datasources/profile_data_source.dart';
import '../../data/datasources/mock_profile_data_source.dart';
import '../../data/datasources/firestore_profile_data_source.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/usecases/profile_usecases.dart';
import 'profile_notifier.dart';
import 'profile_state.dart';

final profileDataSourceProvider = Provider<ProfileDataSource>((ref) {
  final isDev = ref.watch(environmentConfigurationProvider).isDev;
  if (isDev) {
    return MockProfileDataSource();
  }
  return FirestoreProfileDataSource(
    ref.watch(firestoreServiceProvider),
    firebaseAuth: FirebaseAuth.instance,
  );
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(
    ref.watch(profileDataSourceProvider),
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
