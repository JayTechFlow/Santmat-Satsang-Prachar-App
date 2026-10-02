import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/auth_usecases.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';

final checkSessionUseCaseProvider = Provider<CheckSessionUseCase>((ref) => CheckSessionUseCase(ref.watch(authRepositoryProvider)));

final completeOnboardingUseCaseProvider = Provider<CompleteOnboardingUseCase>((ref) => CompleteOnboardingUseCase(ref.watch(authRepositoryProvider)));

final verifyPhoneNumberUseCaseProvider = Provider<VerifyPhoneNumberUseCase>((ref) => VerifyPhoneNumberUseCase(ref.watch(authRepositoryProvider)));

final signInWithPhoneUseCaseProvider = Provider<SignInWithPhoneUseCase>((ref) => SignInWithPhoneUseCase(ref.watch(authRepositoryProvider)));

final hasRegisteredProfileUseCaseProvider = Provider<HasRegisteredProfileUseCase>((ref) => HasRegisteredProfileUseCase(ref.watch(authRepositoryProvider)));

final registerWithPhoneUseCaseProvider = Provider<RegisterWithPhoneUseCase>((ref) => RegisterWithPhoneUseCase(ref.watch(authRepositoryProvider)));

final signInWithGoogleUseCaseProvider = Provider<SignInWithGoogleUseCase>((ref) => SignInWithGoogleUseCase(ref.watch(authRepositoryProvider)));

final registerUserProfileUseCaseProvider = Provider<RegisterUserProfileUseCase>((ref) => RegisterUserProfileUseCase(ref.watch(authRepositoryProvider)));

final signOutUseCaseProvider = Provider<SignOutUseCase>((ref) => SignOutUseCase(ref.watch(authRepositoryProvider)));