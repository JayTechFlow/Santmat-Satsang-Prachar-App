import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'dart:developer' as developer;

class FirebaseAuthDataSource {
  final FirebaseAuth _firebaseAuth;

  FirebaseAuthDataSource(this._firebaseAuth);

  Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  User? get currentUser => _firebaseAuth.currentUser;

  Future<UserCredential> signInAnonymously() async {
    if (kDebugMode) {
      developer.log(
        '4. FirebaseAuth.signInAnonymously() started. Current user before: ${_firebaseAuth.currentUser?.uid}',
      );
    }
    final result = await _firebaseAuth.signInAnonymously();
    if (kDebugMode) {
      developer.log(
        '5. FirebaseAuth.signInAnonymously() completed. Current user after: ${_firebaseAuth.currentUser?.uid}',
      );
    }
    return result;
  }

  Future<UserCredential> signInWithGoogle() async {
    if (kDebugMode) {
      developer.log(
        'FLOW_TRACE: 1. FirebaseAuthDataSource.signInWithGoogle() started',
      );
    }

    // 2. Perform authentication using .authenticate() (Replaces .signIn() in v7.x)
    final GoogleSignInAccount googleUser = await GoogleSignIn.instance
        .authenticate();

    if (kDebugMode) {
      developer.log('FLOW_TRACE: googleUser obtained: ${googleUser.email}');
    }
    final GoogleSignInAuthentication googleAuth = googleUser.authentication;

    // 3. Provide token to Firebase
    final OAuthCredential credential = GoogleAuthProvider.credential(
      idToken: googleAuth.idToken,
    );

    if (kDebugMode) {
      developer.log('FLOW_TRACE: 2. FirebaseAuth.signInWithCredential() started');
    }
    final result = await _firebaseAuth.signInWithCredential(credential);
    if (kDebugMode) {
      developer.log(
        'FLOW_TRACE: 3. FirebaseAuth.signInWithCredential() completed. User: ${result.user?.uid}',
      );
    }
    return result;
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(FirebaseAuthException error) verificationFailed,
  }) async {
    await _firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (PhoneAuthCredential credential) {},
      verificationFailed: verificationFailed,
      codeSent: (String verificationId, int? resendToken) {
        codeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (String verificationId) {},
    );
  }

  Future<UserCredential> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    return await _firebaseAuth.signInWithCredential(credential);
  }

  Future<void> signOut() async {
    await Future.wait([
      _firebaseAuth.signOut(),
      GoogleSignIn.instance.signOut(),
    ]);
  }

  /// Get the current user's ID token
  Future<String?> getIdToken({bool forceRefresh = false}) async {
    final user = _firebaseAuth.currentUser;
    if (user != null) {
      return await user.getIdToken(forceRefresh);
    }
    return null;
  }

  /// Get the current user's refresh token
  Future<String?> getRefreshToken() async {
    final user = _firebaseAuth.currentUser;
    if (user != null) {
      return await user.getIdToken(true); // Force refresh to get new token
    }
    return null;
  }
}
