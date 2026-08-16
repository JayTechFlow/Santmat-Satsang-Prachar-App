import '../entities/app_settings_entity.dart';

abstract class AppSettingsRepository {
  Future<List<AppSettings>> getAll();
  Future<AppSettings?> getById(String id);
  Future<void> add(AppSettings item);
  Future<void> update(AppSettings item);
  Future<void> delete(String id);
}
