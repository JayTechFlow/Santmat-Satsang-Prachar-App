import '../models/featured_content_dto.dart';

abstract class FeaturedContentRemoteDataSource {
  Future<List<FeaturedContentDto>> getAll();
  Future<FeaturedContentDto?> getById(String id);
  Future<void> add(FeaturedContentDto item);
  Future<void> update(FeaturedContentDto item);
  Future<void> delete(String id);
}
