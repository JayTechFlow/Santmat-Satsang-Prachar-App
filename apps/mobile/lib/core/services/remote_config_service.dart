import 'package:firebase_remote_config/firebase_remote_config.dart';

class RemoteConfigService {
  final FirebaseRemoteConfig? _remoteConfigOverride;

  RemoteConfigService({FirebaseRemoteConfig? remoteConfig})
    : _remoteConfigOverride = remoteConfig;

  FirebaseRemoteConfig get _remoteConfig =>
      _remoteConfigOverride ?? FirebaseRemoteConfig.instance;

  Future<void> initialize() async {
    await _remoteConfig.setConfigSettings(
      RemoteConfigSettings(
        fetchTimeout: const Duration(minutes: 1),
        minimumFetchInterval: const Duration(hours: 1),
      ),
    );
    await _remoteConfig.setDefaults(const {
      'maintenance_mode': false,
      'app_version_control': '1.0.0',
      'image_artwork_size': 600,
      'image_icon_size': 256,
      'image_banner_width': 1280,
      'image_banner_height': 720,
    });
    await _remoteConfig.fetchAndActivate();
  }

  bool getBool(String key) => _remoteConfig.getBool(key);
  String getString(String key) => _remoteConfig.getString(key);
  int getInt(String key) => _remoteConfig.getInt(key);
  double getDouble(String key) => _remoteConfig.getDouble(key);

  bool get isMaintenanceMode => getBool('maintenance_mode');
  String get requiredAppVersion => getString('app_version_control');
}
