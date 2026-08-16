import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/user_preference_entity.dart';
import 'profile_state.dart';
import 'profile_providers.dart';

class ProfileNotifier extends Notifier<ProfileState> {
  @override
  ProfileState build() {
    loadProfile();
    return const AsyncValue.loading();
  }

  Future<void> loadProfile() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(getProfileUseCaseProvider);
    final result = await useCase();

    result.when(
      success: (data) => state = AsyncValue.data(data),
      failure: (error) => state = AsyncValue.error(error, StackTrace.current),
    );
  }

  Future<void> updateProfile({
    required String name,
    required String phone,
  }) async {
    final useCase = ref.read(updateProfileUseCaseProvider);
    final result = await useCase(name: name, phone: phone);

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(state.value!.copyWith(name: name, phone: phone));
    }
  }

  Future<void> updateProfilePhoto(String photoPath) async {
    final useCase = ref.read(updateProfilePhotoUseCaseProvider);
    final result = await useCase(photoPath);

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(state.value!.copyWith(photoUrl: photoPath));
    }
  }

  Future<void> updatePreferences(UserPreferenceEntity preferences) async {
    final useCase = ref.read(updatePreferencesUseCaseProvider);
    final result = await useCase(preferences);

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(state.value!.copyWith(preferences: preferences));
    }
  }

  Future<void> logout() async {
    final useCase = ref.read(logoutUseCaseProvider);
    await useCase();
  }
}
