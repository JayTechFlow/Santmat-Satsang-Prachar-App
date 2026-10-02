import 'package:flutter/foundation.dart';
import 'dart:developer' as developer;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/session_model.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/firebase_auth_datasource.dart';
import '../models/user_mapper.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/di/service_locator_registrations.dart';

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
  String? get currentUserId => _dataSource.currentUser?.uid;

  @override
  UserEntity? get currentUser => _dataSource.currentUser?.toEntity();

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
        await _ref
            .read(secureStorageServiceProvider)
            .setRefreshToken(refreshToken);
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
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async {
    try {
      final credential = await _dataSource.signInWithPhone(
        verificationId,
        smsCode,
      );
      final user = credential.user!;
      await _storeAuthTokens(user);
      return Result.success(user.toEntity());
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<UserEntity?>> signInWithGoogle() async {
    try {
      final credential = await _dataSource.signInWithGoogle();
      if (credential == null || credential.user == null) {
        return const Result.success(null);
      }
      final user = credential.user!;
      await _storeAuthTokens(user);
      return Result.success(user.toEntity());
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
  Future<Result<bool>> hasRegisteredProfile(String userId) async {
    try {
      final firestoreService = _ref.read(firestoreServiceProvider);
      final doc = await firestoreService.getDocument(
        FirestoreCollections.users,
        userId,
      );
      return Result.success(doc.exists);
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<UserEntity>> registerUserProfile({
    required String name,
    String? email,
  }) async {
    try {
      final user = _dataSource.currentUser;
      if (user == null) {
        return Result.failure(
          Exception('No authenticated Google user found. Please sign in first.'),
        );
      }
      final firestoreService = _ref.read(firestoreServiceProvider);
      final uid = user.uid;
      final doc = await firestoreService.getDocument(
        FirestoreCollections.users,
        uid,
      );
      if (doc.exists) {
        return Result.failure(
          Exception('Profile already exists. Please sign in instead.'),
        );
      }
      final effectiveEmail = (email != null && email.isNotEmpty)
          ? email
          : (user.email ?? '');
      await firestoreService.setDocument(
        FirestoreCollections.users,
        uid,
        {
          'uid': uid,
          'phone': user.phoneNumber ?? '',
          'name': name,
          'displayName': name,
          if (effectiveEmail.isNotEmpty) 'email': effectiveEmail,
          'photoUrl': user.photoURL ?? '',
          'role': 'mobile_user',
          'status': 'active',
          'accountStatus': 'active',
          'createdAt': FieldValue.serverTimestamp(),
          'updatedAt': FieldValue.serverTimestamp(),
        },
      );
      return Result.success(user.toEntity());
    } on Exception catch (e) {
      return Result.failure(e);
    }
  }

  @override
  Future<Result<UserEntity>> registerWithPhone({
    required String name,
    String? email,
  }) async {
    try {
      final user = _dataSource.currentUser;
      if (user == null) {
        return Result.failure(
          Exception(
            'No verified mobile number found. Please verify your mobile number '
            'with an OTP first.',
          ),
        );
      }
      final firestoreService = _ref.read(firestoreServiceProvider);
      final uid = user.uid;
      final doc = await firestoreService.getDocument(
        FirestoreCollections.users,
        uid,
      );
      if (doc.exists) {
        return Result.failure(
          Exception(
            'This mobile number is already registered. Please sign in instead.',
          ),
        );
      }
      final phoneNum = user.phoneNumber ?? '';
      try {
        await firestoreService.setDocument(
          FirestoreCollections.users,
          uid,
          {
            'uid': uid,
            'phone': phoneNum,
            'name': name,
            'displayName': name,
            if (email != null && email.isNotEmpty) 'email': email,
            'role': 'mobile_user',
            'status': 'active',
            'accountStatus': 'active',
            'createdAt': FieldValue.serverTimestamp(),
            'updatedAt': FieldValue.serverTimestamp(),
          },
        );
        return Result.success(user.toEntity());
      } on Exception catch (profileError) {
        // Rollback: if the profile could not be created, delete the Firebase
        // auth identity to avoid an orphaned account with no application data.
        try {
          await user.delete();
        } catch (deleteError) {
          if (kDebugMode) {
            developer.log(
              'Failed to delete auth user after profile creation failure: '
              '$deleteError',
            );
          }
        }
        return Result.failure(profileError);
      }
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