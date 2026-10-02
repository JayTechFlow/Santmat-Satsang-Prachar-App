import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/user_preference_entity.dart';
import 'profile_state.dart';
import 'profile_providers.dart';
import '../../../../features/authentication/presentation/providers/auth_state_provider.dart';

class ProfileNotifier extends Notifier<ProfileState> {
  @override
  ProfileState build() {
    final authState = ref.watch(authStateProvider);
    return authState.when(
      data: (session) {
        if (session.isAuthenticated &&
            session.user?.id != null &&
            session.user!.id.isNotEmpty) {
          Future.microtask(() => _fetchProfile(session.user!.id));
          return const AsyncValue.loading();
        } else {
          return AsyncValue.error(
            Exception('User not authenticated'),
            StackTrace.current,
          );
        }
      },
      loading: () => const AsyncValue.loading(),
      error: (error, stack) => AsyncValue.error(error, stack),
    );
  }

  Future<void> _fetchProfile(String userId) async {
    final useCase = ref.read(getProfileUseCaseProvider);
    final result = await useCase(userId: userId);

    if (!ref.mounted) return;
    result.when(
      success: (data) => state = AsyncValue.data(data),
      failure: (error) => state = AsyncValue.error(error, StackTrace.current),
    );
  }

  Future<void> loadProfile() async {
    final authState = ref.read(authStateProvider);
    final userId = authState.value?.user?.id;

    if (userId == null || userId.isEmpty) {
      state = AsyncValue.error(
        Exception('User not authenticated'),
        StackTrace.current,
      );
      return;
    }

    state = const AsyncValue.loading();
    await _fetchProfile(userId);
  }

  Future<Result<void>> updateProfile({
    required String name,
    required String phone,
    String? email,
  }) async {
    final useCase = ref.read(updateProfileUseCaseProvider);
    final result = await useCase(name: name, phone: phone, email: email);

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(
        state.value!.copyWith(
          name: name,
          phone: phone,
          email: (email == null || email.isEmpty) ? null : email,
        ),
      );
    }
    return result;
  }

  Future<Result<String>> uploadProfilePhoto(File imageFile) async {
    final useCase = ref.read(uploadProfilePhotoUseCaseProvider);
    final result = await useCase(imageFile);

    if (result.isSuccess && state.hasValue) {
      final downloadUrl = result.data!;
      state = AsyncValue.data(
        state.value!.copyWith(
          customPhotoUrl: downloadUrl,
          photoUrl: downloadUrl,
        ),
      );
    }
    return result;
  }

  Future<Result<void>> updateProfilePhoto(String photoPath) async {
    final useCase = ref.read(updateProfilePhotoUseCaseProvider);
    final result = await useCase(photoPath);

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(
        state.value!.copyWith(
          customPhotoUrl: photoPath,
          photoUrl: photoPath,
        ),
      );
    }
    return result;
  }

  Future<Result<void>> removeProfilePhoto() async {
    final useCase = ref.read(removeProfilePhotoUseCaseProvider);
    final result = await useCase();

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(
        state.value!.copyWith(
          clearCustomPhotoUrl: true,
          photoUrl: state.value!.googlePhotoUrl,
        ),
      );
    }
    return result;
  }

  Future<Result<void>> updatePreferences(UserPreferenceEntity preferences) async {
    final useCase = ref.read(updatePreferencesUseCaseProvider);
    final result = await useCase(preferences);

    if (result.isSuccess && state.hasValue) {
      state = AsyncValue.data(state.value!.copyWith(preferences: preferences));
    }
    return result;
  }

  Future<void> logout() async {
    final useCase = ref.read(logoutUseCaseProvider);
    await useCase();
    await ref.read(authStateProvider.notifier).signOut();
  }
}
