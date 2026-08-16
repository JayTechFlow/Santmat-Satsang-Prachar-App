import '../entities/featured_content_entity.dart';

abstract class FeaturedContentRepository {
  Future<List<FeaturedContent>> getAll();
  Future<FeaturedContent?> getById(String id);
  Future<void> add(FeaturedContent item);
  Future<void> update(FeaturedContent item);
  Future<void> delete(String id);
}
