import '../../../../core/utils/result.dart';
import '../entities/session_model.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Stream<UserEntity?> get authStateChanges;

  Future<Result<SessionModel>> checkSession();
  Future<Result<void>> completeOnboarding();

  Future<Result<UserEntity>> signInWithGoogle();
  Future<Result<UserEntity>> signInAnonymously();
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  );
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  });

  Future<Result<void>> signOut();
}
