import '../../domain/entities/home_banners_entity.dart';
import '../../domain/repositories/home_banners_repository.dart';
import '../datasources/home_banners_remote_datasource.dart';
import '../models/home_banners_dto.dart';

class HomeBannerRepositoryImpl implements HomeBannerRepository {
  final HomeBannerRemoteDataSource _remoteDataSource;

  HomeBannerRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<HomeBanner>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<HomeBanner?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(HomeBanner item) async {
    final dto = HomeBannerDto(
      id: item.id,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(HomeBanner item) async {
    final dto = HomeBannerDto(
      id: item.id,
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
