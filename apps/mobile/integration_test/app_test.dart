import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/services/firestore_service.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/repositories/auth_repository.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';

// Test phone numbers
const String kTestPhone = '+919876543210';
const String kExistingPhone = '+919111111111';
const String kCorrectOtp = '123456';
const String kWrongOtp = '000000';

// ignore: subtype_of_sealed_class
class FakeDocumentSnapshot extends Fake implements DocumentSnapshot<Map<String, dynamic>> {
  final Map<String, dynamic>? _data;
  FakeDocumentSnapshot(this._data);

  @override
  Map<String, dynamic>? data() => _data;

  @override
  bool get exists => _data != null;

  @override
  dynamic operator [](Object field) => _data?[field];
}

class FakeFirestoreService extends Fake implements FirestoreService {
  final Map<String, Map<String, Map<String, dynamic>>> db = {};
  bool shouldFail = false;

  @override
  Future<void> setDocument(
    String collectionPath,
    String documentId,
    Map<String, dynamic> data, {
    bool merge = false,
  }) async {
    if (shouldFail) {
      throw Exception('Firestore write failed');
    }
    db.putIfAbsent(collectionPath, () => {})[documentId] = data;
  }

  @override
  Future<DocumentSnapshot<Map<String, dynamic>>> getDocument(
    String collectionPath,
    String documentId,
  ) async {
    final data = db[collectionPath]?[documentId];
    return FakeDocumentSnapshot(data);
  }
}

/// Phone-first FakeAuthRepository — mirrors production repository behavior.
/// PHONE_PASSWORD_LOGIN = BLOCKED_BY_ARCHITECTURE.
/// Email/Google/Anonymous auth methods are NOT present.
class FakeAuthRepository implements AuthRepository {
  final FakeFirestoreService _firestore;
  UserEntity? _currentUser;
  bool _isFirstLaunch = false;
  bool _customClaimSuspended = false;

  // Phone verification simulation
  String? _lastVerificationId;
  final Map<String, String> _phoneByVerificationId = {};

  FakeAuthRepository(this._firestore);

  @override
  Stream<UserEntity?> get authStateChanges => Stream.value(_currentUser);

  @override
  String? get currentUserId => _currentUser?.id;

  @override
  UserEntity? get currentUser => _currentUser;

  @override
  Future<Result<SessionModel>> checkSession() async {
    if (_customClaimSuspended) {
      return Result.failure(Exception('Account is suspended'));
    }
    return Result.success(SessionModel(user: _currentUser, isFirstLaunch: _isFirstLaunch));
  }

  @override
  Future<Result<void>> completeOnboarding() async {
    _isFirstLaunch = false;
    return const Result.success(null);
  }

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async {
    final vid = 'verification_id_${phoneNumber.hashCode}';
    _lastVerificationId = vid;
    _phoneByVerificationId[vid] = phoneNumber;
    codeSent(vid);
    return const Result.success(null);
  }

  @override
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async {
    if (smsCode != kCorrectOtp) {
      return Result.failure(
        Exception('The sms verification code is invalid. [ invalid-verification-code ]'),
      );
    }
    final phone = _phoneByVerificationId[verificationId] ?? '+0000000000';
    final uid = 'phone_uid_${phone.hashCode}';
    _currentUser = UserEntity(
      id: uid,
      phoneNumber: phone,
      displayName: 'Phone User ($phone)',
      isAnonymous: false,
    );
    return Result.success(_currentUser!);
  }

  @override
  Future<Result<bool>> hasRegisteredProfile(String userId) async {
    return Result.success(
      _firestore.db['users']?.containsKey(userId) ?? false,
    );
  }

  @override
  Future<Result<UserEntity>> registerWithPhone({
    required String name,
    String? email,
  }) async {
    final user = _currentUser;
    if (user == null) {
      return Result.failure(
        Exception('No verified phone identity. OTP must be verified first.'),
      );
    }
    final uid = user.id;
    final profileExists = (_firestore.db['users']?.containsKey(uid)) ?? false;
    if (profileExists) {
      return Result.failure(
        Exception('This mobile number is already registered. Please sign in instead.'),
      );
    }
    try {
      await _firestore.setDocument('users', uid, {
        'uid': uid,
        'phone': user.phoneNumber ?? '',
        'name': name,
        'displayName': name,
        if (email != null && email.isNotEmpty) 'email': email,
        'role': 'mobile_user',
        'status': 'active',
      });
    } catch (e) {
      _currentUser = null;
      return Result.failure(e as Exception);
    }
    return Result.success(user);
  }

  @override
  Future<Result<UserEntity?>> signInWithGoogle() async {
    const uid = 'google_integration_uid';
    _currentUser = const UserEntity(
      id: uid,
      displayName: 'Integration User',
      email: 'user@integration.com',
      isAnonymous: false,
    );
    return Result.success(_currentUser);
  }

  @override
  Future<Result<UserEntity>> registerUserProfile({
    required String name,
    String? email,
  }) async {
    final user = _currentUser;
    if (user == null) {
      return Result.failure(Exception('No Google user found.'));
    }
    final uid = user.id;
    await _firestore.setDocument('users', uid, {
      'uid': uid,
      'name': name,
      'displayName': name,
      if (email != null && email.isNotEmpty) 'email': email,
      'role': 'mobile_user',
      'status': 'active',
    });
    return Result.success(user);
  }

  @override
  Future<Result<void>> signOut() async {
    _currentUser = null;
    return const Result.success(null);
  }

  void suspendUser() {
    _customClaimSuspended = true;
  }
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('SSP Phone-First Authentication Integration Tests', () {
    late FakeFirestoreService fakeFirestore;
    late FakeAuthRepository fakeAuth;

    setUp(() {
      fakeFirestore = FakeFirestoreService();
      fakeAuth = FakeAuthRepository(fakeFirestore);
    });

    testWidgets('Phone registration success — Firestore profile has role=mobile_user',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      // Simulate OTP verified
      await fakeAuth.verifyPhoneNumber(
        phoneNumber: kTestPhone,
        codeSent: (vid) => null,
        verificationFailed: (err) => null,
      );
      final signInResult = await fakeAuth.signInWithPhone(
        fakeAuth._lastVerificationId!,
        kCorrectOtp,
      );
      expect(signInResult.isSuccess, true);

      // Register profile
      final regResult = await fakeAuth.registerWithPhone(
        name: 'SSP Test User',
        email: 'test@ssp.org',
      );
      expect(regResult.isSuccess, true);

      // Verify Firestore profile
      final uid = fakeAuth.currentUserId!;
      final doc = await fakeFirestore.getDocument('users', uid);
      expect(doc.exists, true);
      expect(doc['role'], 'mobile_user');
      expect(doc['status'], 'active');
      expect(doc['email'], 'test@ssp.org');
    });

    testWidgets('Phone registration Firestore rollback on write failure',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      // Simulate OTP verified
      await fakeAuth.verifyPhoneNumber(
        phoneNumber: kTestPhone,
        codeSent: (vid) => null,
        verificationFailed: (err) => null,
      );
      await fakeAuth.signInWithPhone(fakeAuth._lastVerificationId!, kCorrectOtp);

      // Simulate Firestore failure
      fakeFirestore.shouldFail = true;
      final regResult = await fakeAuth.registerWithPhone(name: 'SSP Test User');

      expect(regResult.isSuccess, false);
      expect(fakeAuth._currentUser, isNull); // rollback: cleared currentUser
    });

    testWidgets('Invalid OTP is rejected with correct Firebase error code',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      await fakeAuth.verifyPhoneNumber(
        phoneNumber: kTestPhone,
        codeSent: (vid) => null,
        verificationFailed: (err) => null,
      );

      final result = await fakeAuth.signInWithPhone(
        fakeAuth._lastVerificationId!,
        kWrongOtp,
      );

      expect(result.isSuccess, false);
      expect(result.error.toString(), contains('invalid-verification-code'));
    });

    testWidgets('Unregistered phone — hasRegisteredProfile returns false',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      await fakeAuth.verifyPhoneNumber(
        phoneNumber: kExistingPhone,
        codeSent: (vid) => null,
        verificationFailed: (err) => null,
      );
      await fakeAuth.signInWithPhone(fakeAuth._lastVerificationId!, kCorrectOtp);
      final uid = fakeAuth.currentUserId!;

      final hasProfile = await fakeAuth.hasRegisteredProfile(uid);
      expect(hasProfile.isSuccess, true);
      expect(hasProfile.data, false); // No Firestore doc was created
    });

    testWidgets('Duplicate phone registration is rejected', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      // First registration
      await fakeAuth.verifyPhoneNumber(
        phoneNumber: kTestPhone,
        codeSent: (vid) => null,
        verificationFailed: (err) => null,
      );
      await fakeAuth.signInWithPhone(fakeAuth._lastVerificationId!, kCorrectOtp);
      final firstReg = await fakeAuth.registerWithPhone(name: 'First User');
      expect(firstReg.isSuccess, true);

      // Second registration attempt with same phone
      final secondReg = await fakeAuth.registerWithPhone(name: 'Duplicate User');
      expect(secondReg.isSuccess, false);
      expect(secondReg.error.toString(), contains('already registered'));
    });

    testWidgets('Phone sign in + sign out + session restore', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      // Sign in
      await fakeAuth.verifyPhoneNumber(
        phoneNumber: kTestPhone,
        codeSent: (vid) => null,
        verificationFailed: (err) => null,
      );
      final signInResult = await fakeAuth.signInWithPhone(
        fakeAuth._lastVerificationId!,
        kCorrectOtp,
      );
      expect(signInResult.isSuccess, true);
      expect(fakeAuth._currentUser, isNotNull);

      // Sign out
      await fakeAuth.signOut();
      expect(fakeAuth._currentUser, isNull);

      // Session should return null user
      final session = await fakeAuth.checkSession();
      expect(session.isSuccess, true);
      expect(session.data?.user, isNull);
    });

    testWidgets('Suspended account rejects checkSession', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            firestoreServiceProvider.overrideWithValue(fakeFirestore),
            authRepositoryProvider.overrideWithValue(fakeAuth),
          ],
          child: const App(),
        ),
      );
      await tester.pumpAndSettle();

      fakeAuth.suspendUser();

      final result = await fakeAuth.checkSession();
      expect(result.isSuccess, false);
      expect(result.error.toString(), contains('suspended'));
    });
  });
}
