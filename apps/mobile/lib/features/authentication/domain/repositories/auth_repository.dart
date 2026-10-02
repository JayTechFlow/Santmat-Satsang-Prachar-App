import '../../../../core/utils/result.dart';
import '../entities/session_model.dart';
import '../entities/user_entity.dart';

/// Application authentication repository.
///
/// Phone-first: sign in / register exclusively through verified mobile
/// numbers. A Firebase Phone Auth identity is created during OTP verification
/// but is only considered a registered application account once a document
/// exists at `users/{uid}`.
abstract class AuthRepository {
  Stream<UserEntity?> get authStateChanges;
  String? get currentUserId;
  UserEntity? get currentUser;

  Future<Result<SessionModel>> checkSession();
  Future<Result<void>> completeOnboarding();

  Future<Result<UserEntity?>> signInWithGoogle();

  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  });

  /// Verifies the OTP and signs the user in with Firebase Phone Auth.
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  );

  /// True when a registered profile (`users/{uid}`) exists for [userId].
  Future<Result<bool>> hasRegisteredProfile(String userId);

  /// Creates the canonical `users/{uid}` profile for the currently
  /// authenticated user. Fails if a profile already exists.
  Future<Result<UserEntity>> registerUserProfile({
    required String name,
    String? email,
  });

  Future<Result<UserEntity>> registerWithPhone({
    required String name,
    String? email,
  });

  Future<Result<void>> signOut();
}