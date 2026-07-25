import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/profile/data/datasources/mock_profile_data_source.dart';
import 'package:santmat_satsang_prachar/features/profile/data/repositories/profile_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/repositories/auth_repository.dart';

import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';

class MockAuthRepository implements AuthRepository {
  @override
  Stream<UserEntity?> get authStateChanges => Stream.value(null);

  @override
  Future<Result<SessionModel>> checkSession() async =>
      throw UnimplementedError();

  @override
  Future<Result<void>> completeOnboarding() async => throw UnimplementedError();

  @override
  Future<Result<UserEntity>> signInAnonymously() async =>
      throw UnimplementedError();

  @override
  Future<Result<UserEntity>> signInWithGoogle() async =>
      throw UnimplementedError();

  @override
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async => throw UnimplementedError();

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async => throw UnimplementedError();

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
    final result = await repository.getProfile();
    expect(result.isSuccess, true);
    expect(result.data?.name, 'Santmat Devotee');
  });

  test('updateProfile should return Result.success', () async {
    final result = await repository.updateProfile(
      name: 'New Name',
      phone: '111',
    );
    expect(result.isSuccess, true);

    final updated = await repository.getProfile();
    expect(updated.data?.name, 'New Name');
  });
}
