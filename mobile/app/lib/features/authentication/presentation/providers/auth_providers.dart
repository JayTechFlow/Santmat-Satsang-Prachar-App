import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/auth_usecases.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';


final checkSessionUseCaseProvider = Provider<CheckSessionUseCase>((ref) {
  return CheckSessionUseCase(ref.watch(authRepositoryProvider));
});

final completeOnboardingUseCaseProvider = Provider<CompleteOnboardingUseCase>((
  ref,
) {
  return CompleteOnboardingUseCase(ref.watch(authRepositoryProvider));
});

final signInWithGoogleUseCaseProvider = Provider<SignInWithGoogleUseCase>((
  ref,
) {
  return SignInWithGoogleUseCase(ref.watch(authRepositoryProvider));
});

final signInAnonymouslyUseCaseProvider = Provider<SignInAnonymouslyUseCase>((
  ref,
) {
  return SignInAnonymouslyUseCase(ref.watch(authRepositoryProvider));
});

final signOutUseCaseProvider = Provider<SignOutUseCase>((ref) {
  return SignOutUseCase(ref.watch(authRepositoryProvider));
});
