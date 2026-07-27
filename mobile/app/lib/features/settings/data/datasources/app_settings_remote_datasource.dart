import '../models/app_settings_dto.dart';

abstract class AppSettingsRemoteDataSource {
  Future<List<AppSettingsDto>> getAll();
  Future<AppSettingsDto?> getById(String id);
  Future<void> add(AppSettingsDto item);
  Future<void> update(AppSettingsDto item);
  Future<void> delete(String id);
}
