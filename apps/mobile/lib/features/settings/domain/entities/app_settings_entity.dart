class AppSettings {
  final String id;
  final String version;
  final String minVersion;
  final bool maintenanceMode;

  const AppSettings({
    required this.id,
    required this.version,
    required this.minVersion,
    required this.maintenanceMode,
  });
}
