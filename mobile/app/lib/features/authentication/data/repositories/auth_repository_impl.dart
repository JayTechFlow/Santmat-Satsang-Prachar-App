import 'package:flutter/foundation.dart';
import 'dart:developer' as developer;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/session_model.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/firebase_auth_datasource.dart';
import '../models/user_mapper.dart';
import '../../../../core/storage/secure_storage_service.dart';

class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuthDataSource _dataSource;
  final SharedPreferences _prefs;
  final Ref _ref;

  static const String _firstLaunchKey = 'is_first_launch';

  AuthRepositoryImpl(this._dataSource, this._prefs, this._ref);

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

  Future<void> _storeAuthTokens(User user) async {
    try {
      final idToken = await user.getIdToken();
      final refreshToken = await user.getIdToken(true);
      
      if (idToken != null) {
        await _ref.read(secureStorageServiceProvider).setAccessToken(idToken);
      }
      if (refreshToken != null) {
        await _ref.read(secureStorageServiceProvider).setRefreshToken(refreshToken);
      }
      await _ref.read(secureStorageServiceProvider).setUserId(user.uid);
    } catch (e) {
      if (kDebugMode) {
        developer.log('Failed to store auth tokens: $e');
      }
    }
  }

  Future<void> _clearAuthTokens() async {
    try {
      await _ref.read(secureStorageServiceProvider).clearAuthTokens();
    } catch (e) {
      if (kDebugMode) {
        developer.log('Failed to clear auth tokens: $e');
      }
    }
  }

  @override
  Future<Result<UserEntity>> signInAnonymously() async {
    try {
      final credential = await _dataSource.signInAnonymously();
      final user = credential.user;
      if (user != null) {
        await _storeAuthTokens(user);
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
        await _storeAuthTokens(user);
        return Result.success(user.toEntity());
      }
      return Result.failure(Exception('Google sign in failed'));
    } on Exception catch (e) {
      if (kDebugMode) {
        developer.log(
          'FLOW_TRACE: AuthRepositoryImpl.signInWithGoogle error: $e',
        );
      }
      return Result.failure(Exception(e.toString()));
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
        await _storeAuthTokens(user);
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
      await _clearAuthTokens();
      return const Result.success(null);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }
}