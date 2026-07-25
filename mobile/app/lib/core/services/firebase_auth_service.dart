import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import '../../features/authentication/domain/entities/user_entity.dart';
import '../../features/authentication/domain/entities/session_model.dart';
import '../../features/authentication/domain/repositories/auth_repository.dart';
import '../utils/result.dart';

class FirebaseAuthService implements AuthRepository {
  final fb_auth.FirebaseAuth? _authOverride;

  FirebaseAuthService({fb_auth.FirebaseAuth? auth}) 
      : _authOverride = auth;

  fb_auth.FirebaseAuth get _auth => _authOverride ?? fb_auth.FirebaseAuth.instance;

  @override
  Stream<UserEntity?> get authStateChanges {
    return _auth.authStateChanges().map((user) {
      if (user == null) return null;
      return UserEntity(
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoURL,
        phoneNumber: user.phoneNumber,
        isAnonymous: user.isAnonymous,
      );
    });
  }

  @override
  Future<Result<SessionModel>> checkSession() async {
    final user = _auth.currentUser;
    if (user != null) {
      final userEntity = UserEntity(
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoURL,
        phoneNumber: user.phoneNumber,
        isAnonymous: user.isAnonymous,
      );
      return Result.success(SessionModel(
        user: userEntity,
        isFirstLaunch: false, // abstracted for infrastructure
      ));
    }
    return const Result.success(SessionModel(isFirstLaunch: false));
  }

  @override
  Future<Result<void>> completeOnboarding() async {
    // simplified for infrastructure level
    return const Result.success(null);
  }

  @override
  Future<Result<UserEntity>> signInWithGoogle() async {
    return Result.failure(Exception('Not implemented'));
  }

  @override
  Future<Result<UserEntity>> signInAnonymously() async {
    try {
      final credential = await _auth.signInAnonymously();
      final user = credential.user!;
      return Result.success(UserEntity(
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoUrl: user.photoURL,
        phoneNumber: user.phoneNumber,
        isAnonymous: user.isAnonymous,
      ));
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }

  @override
  Future<Result<UserEntity>> signInWithPhone(String verificationId, String smsCode) async {
    return Result.failure(Exception('Not implemented'));
  }

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async {
    return Result.failure(Exception('Not implemented'));
  }

  @override
  Future<Result<void>> signOut() async {
    try {
      await _auth.signOut();
      return const Result.success(null);
    } catch (e) {
      return Result.failure(Exception(e.toString()));
    }
  }
}

