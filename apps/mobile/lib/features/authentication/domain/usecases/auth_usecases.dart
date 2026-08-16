import '../../../../core/utils/result.dart';
import '../entities/session_model.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class CheckSessionUseCase {
  final AuthRepository _repository;
  const CheckSessionUseCase(this._repository);
  Future<Result<SessionModel>> call() => _repository.checkSession();
}

class CompleteOnboardingUseCase {
  final AuthRepository _repository;
  const CompleteOnboardingUseCase(this._repository);
  Future<Result<void>> call() => _repository.completeOnboarding();
}

class SignInWithGoogleUseCase {
  final AuthRepository _repository;
  const SignInWithGoogleUseCase(this._repository);
  Future<Result<UserEntity>> call() => _repository.signInWithGoogle();
}

class SignInAnonymouslyUseCase {
  final AuthRepository _repository;
  const SignInAnonymouslyUseCase(this._repository);
  Future<Result<UserEntity>> call() => _repository.signInAnonymously();
}

class SignOutUseCase {
  final AuthRepository _repository;
  const SignOutUseCase(this._repository);
  Future<Result<void>> call() => _repository.signOut();
}
