import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_profile_data_source.dart';
import 'package:santmat_satsang_prachar/features/profile/data/repositories/profile_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/repositories/auth_repository.dart';

import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';

/// Minimal phone-first AuthRepository stub for ProfileRepository tests.
class MockAuthRepository implements AuthRepository {
  @override
  Stream<UserEntity?> get authStateChanges => Stream.value(null);

  @override
  String? get currentUserId => 'test_user_123';

  @override
  UserEntity? get currentUser => const UserEntity(id: 'test_user_123', isAnonymous: false);

  @override
  Future<Result<SessionModel>> checkSession() async => throw UnimplementedError();

  @override
  Future<Result<void>> completeOnboarding() async => throw UnimplementedError();

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async =>
      throw UnimplementedError();

  @override
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async =>
      throw UnimplementedError();

  @override
  Future<Result<bool>> hasRegisteredProfile(String userId) async =>
      const Result.success(true);

  @override
  Future<Result<UserEntity>> registerWithPhone({
    required String name,
    String? email,
  }) async =>
      throw UnimplementedError();

  @override
  Future<Result<UserEntity?>> signInWithGoogle() async => throw UnimplementedError();

  @override
  Future<Result<UserEntity>> registerUserProfile({
    required String name,
    String? email,
  }) async =>
      throw UnimplementedError();

  @override
  Future<Result<void>> signOut() async => const Result.success(null);
}

void main() {
  late MockProfileDataSource dataSource;
  late MockAuthRepository authRepository;
  late ProfileRepositoryImpl repository;

  setUp(() {
    dataSource = MockProfileDataSource();
    authRepository = MockAuthRepository();
    repository = ProfileRepositoryImpl(dataSource, authRepository);
  });

  test('getProfile should return Result.success', () async {
    final result = await repository.getProfile(userId: 'test_user_123');
    expect(result.isSuccess, true);
    expect(result.data?.name, 'Santmat Devotee');
  });

  test('updateProfile should return Result.success', () async {
    final result = await repository.updateProfile(
      name: 'New Name',
      phone: '111',
    );
    expect(result.isSuccess, true);

    final updated = await repository.getProfile(userId: 'test_user_123');
    expect(updated.data?.name, 'New Name');
  });

  test('updateProfile with optional email updates email field', () async {
    final result = await repository.updateProfile(
      name: 'Devotee Updated',
      phone: '+919999999999',
      email: 'updated@santmat.org',
    );
    expect(result.isSuccess, true);

    final updated = await repository.getProfile(userId: 'test_user_123');
    expect(updated.data?.email, 'updated@santmat.org');
  });
}
