import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/repositories/auth_repository.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/usecases/auth_usecases.dart';

class MockAuthRepository implements AuthRepository {
  SessionModel sessionToReturn = const SessionModel(
    user: null,
    isFirstLaunch: true,
  );
  Result<UserEntity> signInResult = const Result.success(
    UserEntity(
      id: 'test_id',
      phoneNumber: '+919876543210',
      displayName: 'Test User',
      isAnonymous: false,
    ),
  );
  Result<bool> profileResult = const Result.success(false);
  bool completeOnboardingCalled = false;
  bool signOutCalled = false;
  bool registerCalled = false;
  String? registeredName;
  String? registeredEmail;

  @override
  Stream<UserEntity?> get authStateChanges => Stream.value(sessionToReturn.user);

  @override
  String? get currentUserId => sessionToReturn.user?.id;

  @override
  UserEntity? get currentUser => sessionToReturn.user;

  @override
  Future<Result<SessionModel>> checkSession() async =>
      Result.success(sessionToReturn);

  @override
  Future<Result<void>> completeOnboarding() async {
    completeOnboardingCalled = true;
    return const Result.success(null);
  }

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async {
    codeSent('vid_123');
    return const Result.success(null);
  }

  @override
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async => signInResult;

  @override
  Future<Result<bool>> hasRegisteredProfile(String userId) async =>
      profileResult;

  @override
  Future<Result<UserEntity>> registerWithPhone({
    required String name,
    String? email,
  }) async {
    registerCalled = true;
    registeredName = name;
    registeredEmail = email;
    return signInResult;
  }

  @override
  Future<Result<UserEntity?>> signInWithGoogle() async =>
      const Result.success(UserEntity(id: 'google_uid_test', email: 'test@google.com', isAnonymous: false));

  @override
  Future<Result<UserEntity>> registerUserProfile({
    required String name,
    String? email,
  }) async {
    registerCalled = true;
    registeredName = name;
    registeredEmail = email;
    return signInResult;
  }

  @override
  Future<Result<void>> signOut() async {
    signOutCalled = true;
    return const Result.success(null);
  }
}

void main() {
  late MockAuthRepository mockAuthRepository;
  late CheckSessionUseCase checkSessionUseCase;
  late CompleteOnboardingUseCase completeOnboardingUseCase;
  late VerifyPhoneNumberUseCase verifyPhoneNumberUseCase;
  late SignInWithPhoneUseCase signInWithPhoneUseCase;
  late HasRegisteredProfileUseCase hasRegisteredProfileUseCase;
  late RegisterWithPhoneUseCase registerWithPhoneUseCase;
  late SignOutUseCase signOutUseCase;

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    checkSessionUseCase = CheckSessionUseCase(mockAuthRepository);
    completeOnboardingUseCase = CompleteOnboardingUseCase(mockAuthRepository);
    verifyPhoneNumberUseCase = VerifyPhoneNumberUseCase(mockAuthRepository);
    signInWithPhoneUseCase = SignInWithPhoneUseCase(mockAuthRepository);
    hasRegisteredProfileUseCase = HasRegisteredProfileUseCase(mockAuthRepository);
    registerWithPhoneUseCase = RegisterWithPhoneUseCase(mockAuthRepository);
    signOutUseCase = SignOutUseCase(mockAuthRepository);
  });

  group('AuthUseCases Tests', () {
    test('CheckSessionUseCase returns session from repository', () async {
      final result = await checkSessionUseCase();

      expect(result.isSuccess, true);
      expect(result.data?.isFirstLaunch, true);
    });

    test('CompleteOnboardingUseCase marks onboarding complete', () async {
      final result = await completeOnboardingUseCase();

      expect(result.isSuccess, true);
      expect(mockAuthRepository.completeOnboardingCalled, true);
    });

    test('VerifyPhoneNumberUseCase triggers codeSent callback', () async {
      String? sentVerId;

      final result = await verifyPhoneNumberUseCase(
        phoneNumber: '+919876543210',
        codeSent: (verId) => sentVerId = verId,
        verificationFailed: (err) {},
      );

      expect(result.isSuccess, true);
      expect(sentVerId, 'vid_123');
    });

    test('SignInWithPhoneUseCase returns phone user entity', () async {
      final result = await signInWithPhoneUseCase('vid_123', '123456');

      expect(result.isSuccess, true);
      expect(result.data?.id, 'test_id');
      expect(result.data?.phoneNumber, '+919876543210');
    });

    test('HasRegisteredProfileUseCase reports profile existence', () async {
      final result = await hasRegisteredProfileUseCase('test_id');

      expect(result.isSuccess, true);
      expect(result.data, false);
    });

    test('RegisterWithPhoneUseCase passes name and email through', () async {
      final result = await registerWithPhoneUseCase(
        name: 'Test User',
        email: 'test@example.com',
      );

      expect(result.isSuccess, true);
      expect(mockAuthRepository.registerCalled, true);
      expect(mockAuthRepository.registeredName, 'Test User');
      expect(mockAuthRepository.registeredEmail, 'test@example.com');
    });

    test('RegisterWithPhoneUseCase allows null email', () async {
      final result = await registerWithPhoneUseCase(name: 'Test User');

      expect(result.isSuccess, true);
      expect(mockAuthRepository.registeredEmail, isNull);
    });

    test('SignOutUseCase completes sign out call', () async {
      final result = await signOutUseCase();

      expect(result.isSuccess, true);
      expect(mockAuthRepository.signOutCalled, true);
    });
  });
}