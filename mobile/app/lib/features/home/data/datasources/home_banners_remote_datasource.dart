import '../models/home_banners_dto.dart';

abstract class HomeBannerRemoteDataSource {
  Future<List<HomeBannerDto>> getAll();
  Future<HomeBannerDto?> getById(String id);
  Future<void> add(HomeBannerDto item);
  Future<void> update(HomeBannerDto item);
  Future<void> delete(String id);
}
