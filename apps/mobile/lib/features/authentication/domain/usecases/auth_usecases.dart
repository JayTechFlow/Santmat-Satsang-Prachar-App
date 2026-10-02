import '../../../../core/utils/result.dart';
import '../entities/session_model.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

/// Use case for checking the current session.
class CheckSessionUseCase {
  final AuthRepository _repository;
  const CheckSessionUseCase(this._repository);

  Future<Result<SessionModel>> call() => _repository.checkSession();
}

/// Use case for completing onboarding flow.
class CompleteOnboardingUseCase {
  final AuthRepository _repository;
  const CompleteOnboardingUseCase(this._repository);

  Future<Result<void>> call() => _repository.completeOnboarding();
}

/// Use case for verifying phone number via OTP.
class VerifyPhoneNumberUseCase {
  final AuthRepository _repository;
  const VerifyPhoneNumberUseCase(this._repository);

  Future<Result<void>> call({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) =>
      _repository.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        codeSent: codeSent,
        verificationFailed: verificationFailed,
      );
}

/// Use case for signing in with phone verification code.
class SignInWithPhoneUseCase {
  final AuthRepository _repository;
  const SignInWithPhoneUseCase(this._repository);

  Future<Result<UserEntity>> call(String verificationId, String smsCode) =>
      _repository.signInWithPhone(verificationId, smsCode);
}

/// Use case for checking whether a Firebase identity has a registered profile.
class HasRegisteredProfileUseCase {
  final AuthRepository _repository;
  const HasRegisteredProfileUseCase(this._repository);

  Future<Result<bool>> call(String userId) =>
      _repository.hasRegisteredProfile(userId);
}

/// Use case for completing registration for a verified phone user.
class RegisterWithPhoneUseCase {
  final AuthRepository _repository;
  const RegisterWithPhoneUseCase(this._repository);

  Future<Result<UserEntity>> call({
    required String name,
    String? email,
  }) =>
      _repository.registerWithPhone(name: name, email: email);
}

/// Use case for signing in with Google.
class SignInWithGoogleUseCase {
  final AuthRepository _repository;
  const SignInWithGoogleUseCase(this._repository);

  Future<Result<UserEntity?>> call() => _repository.signInWithGoogle();
}

/// Use case for completing profile registration for an authenticated user.
class RegisterUserProfileUseCase {
  final AuthRepository _repository;
  const RegisterUserProfileUseCase(this._repository);

  Future<Result<UserEntity>> call({
    required String name,
    String? email,
  }) =>
      _repository.registerUserProfile(name: name, email: email);
}

/// Use case for signing out.
class SignOutUseCase {
  final AuthRepository _repository;
  const SignOutUseCase(this._repository);

  Future<Result<void>> call() => _repository.signOut();
}