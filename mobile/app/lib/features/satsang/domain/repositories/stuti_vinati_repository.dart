import '../entities/stuti_vinati_entity.dart';

abstract class StutiVinatiRepository {
  Future<List<StutiVinati>> getAll();
  Future<StutiVinati?> getById(String id);
  Future<void> add(StutiVinati item);
  Future<void> update(StutiVinati item);
  Future<void> delete(String id);
}
