import '../../domain/entities/app_settings_entity.dart';

class AppSettingsDto extends AppSettings {
  const AppSettingsDto({
    required super.id,
    required super.version,
    required super.minVersion,
    required super.maintenanceMode,
  });

  factory AppSettingsDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return AppSettingsDto(
      id: id ?? json['id'] as String? ?? '',
      version: json['version'] as String,
      minVersion: json['minVersion'] as String,
      maintenanceMode: json['maintenanceMode'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'version': version,
      'minVersion': minVersion,
      'maintenanceMode': maintenanceMode,
    };
  }
}
