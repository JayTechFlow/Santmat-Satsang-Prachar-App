import '../../domain/entities/featured_content_entity.dart';
import '../../domain/repositories/featured_content_repository.dart';
import '../datasources/featured_content_remote_datasource.dart';
import '../models/featured_content_dto.dart';

class FeaturedContentRepositoryImpl implements FeaturedContentRepository {
  final FeaturedContentRemoteDataSource _remoteDataSource;

  FeaturedContentRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<FeaturedContent>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<FeaturedContent?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(FeaturedContent item) async {
    final dto = FeaturedContentDto(
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      contentId: item.contentId,
      imageUrl: item.imageUrl,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(FeaturedContent item) async {
    final dto = FeaturedContentDto(
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      contentId: item.contentId,
      imageUrl: item.imageUrl,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
