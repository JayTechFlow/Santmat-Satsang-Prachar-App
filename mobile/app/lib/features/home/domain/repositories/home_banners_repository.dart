import '../entities/home_banners_entity.dart';

abstract class HomeBannerRepository {
  Future<List<HomeBanner>> getAll();
  Future<HomeBanner?> getById(String id);
  Future<void> add(HomeBanner item);
  Future<void> update(HomeBanner item);
  Future<void> delete(String id);
}
