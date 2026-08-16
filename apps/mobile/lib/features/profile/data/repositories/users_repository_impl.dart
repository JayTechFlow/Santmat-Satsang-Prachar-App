import '../../domain/entities/users_entity.dart';
import '../../domain/repositories/users_repository.dart';
import '../datasources/users_remote_datasource.dart';
import '../models/users_dto.dart';

class UserEntityRepositoryImpl implements UserEntityRepository {
  final UserEntityRemoteDataSource _remoteDataSource;

  UserEntityRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<UserEntity>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<UserEntity?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(UserEntity item) async {
    final dto = UserEntityDto(
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      photoUrl: item.photoUrl,
      createdAt: item.createdAt,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(UserEntity item) async {
    final dto = UserEntityDto(
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      photoUrl: item.photoUrl,
      createdAt: item.createdAt,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
