import '../models/users_dto.dart';

abstract class UserEntityRemoteDataSource {
  Future<List<UserEntityDto>> getAll();
  Future<UserEntityDto?> getById(String id);
  Future<void> add(UserEntityDto item);
  Future<void> update(UserEntityDto item);
  Future<void> delete(String id);
}
