import '../models/stuti_vinati_dto.dart';

abstract class StutiVinatiRemoteDataSource {
  Future<List<StutiVinatiDto>> getAll();
  Stream<List<StutiVinatiDto>> watchAll();
  Future<StutiVinatiDto?> getById(String id);
  Future<void> add(StutiVinatiDto item);
  Future<void> update(StutiVinatiDto item);
  Future<void> delete(String id);
}
