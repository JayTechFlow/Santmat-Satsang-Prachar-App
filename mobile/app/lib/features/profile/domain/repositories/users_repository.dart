import '../entities/users_entity.dart';

abstract class UserEntityRepository {
  Future<List<UserEntity>> getAll();
  Future<UserEntity?> getById(String id);
  Future<void> add(UserEntity item);
  Future<void> update(UserEntity item);
  Future<void> delete(String id);
}
