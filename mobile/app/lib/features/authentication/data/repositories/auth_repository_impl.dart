import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/session_model.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/firebase_auth_datasource.dart';
import '../models/user_mapper.dart';

class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuthDataSource _dataSource;
  final SharedPreferences _prefs;

  static const String _firstLaunchKey = 'is_first_launch';

  AuthRepositoryImpl(this._dataSource, this._prefs);

  @override
  Stream<UserEntity?> get authStateChanges =>
      _dataSource.authStateChanges.map((user) => user?.toEntity());

  @override
  Future<Result<SessionModel>> checkSession() async {
    try {
      final isFirstLaunch = _prefs.getBool(_firstLaunchKey) ?? true;
      final user = _dataSource.currentUser?.toEntity();
      return Result.success(
        SessionModel(user: user, isFirstLaunch: isFirstLaunch),
      );
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> completeOnboarding() async {
    try {
      await _prefs.setBool(_firstLaunchKey, false);
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<UserEntity>> signInAnonymously() async {
    try {
      final credential = await _dataSource.signInAnonymously();
      final user = credential.user;
      if (user != null) {
        return Result.success(user.toEntity());
      }
      return Result.failure(Exception('Anonymous sign in failed'));
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<UserEntity>> signInWithGoogle() async {
    try {
      final credential = await _dataSource.signInWithGoogle();
      final user = credential.user;
      if (user != null) {
        return Result.success(user.toEntity());
      }
      return Result.failure(Exception('Google sign in failed'));
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async {
    try {
      final credential = await _dataSource.signInWithPhone(
        verificationId,
        smsCode,
      );
      final user = credential.user;
      if (user != null) {
        return Result.success(user.toEntity());
      }
      return Result.failure(Exception('Phone sign in failed'));
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async {
    try {
      await _dataSource.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        codeSent: codeSent,
        verificationFailed: verificationFailed,
      );
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<void>> signOut() async {
    try {
      await _dataSource.signOut();
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}
