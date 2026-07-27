import '../../domain/entities/app_settings_entity.dart';
import '../../domain/repositories/app_settings_repository.dart';
import '../datasources/app_settings_remote_datasource.dart';
import '../models/app_settings_dto.dart';

class AppSettingsRepositoryImpl implements AppSettingsRepository {
  final AppSettingsRemoteDataSource _remoteDataSource;

  AppSettingsRepositoryImpl(this._remoteDataSource);

  @override
  Future<List<AppSettings>> getAll() async {
    return await _remoteDataSource.getAll();
  }

  @override
  Future<AppSettings?> getById(String id) async {
    return await _remoteDataSource.getById(id);
  }

  @override
  Future<void> add(AppSettings item) async {
    final dto = AppSettingsDto(
      id: item.id,
      version: item.version,
      minVersion: item.minVersion,
      maintenanceMode: item.maintenanceMode,
    );
    await _remoteDataSource.add(dto);
  }

  @override
  Future<void> update(AppSettings item) async {
    final dto = AppSettingsDto(
      id: item.id,
      version: item.version,
      minVersion: item.minVersion,
      maintenanceMode: item.maintenanceMode,
    );
    await _remoteDataSource.update(dto);
  }

  @override
  Future<void> delete(String id) async {
    await _remoteDataSource.delete(id);
  }
}
