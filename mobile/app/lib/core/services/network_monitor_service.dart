import 'dart:async';
import 'connectivity_service.dart';

class NetworkMonitorService {
  final ConnectivityService _connectivityService;
  StreamSubscription<bool>? _subscription;
  bool _isOnline = true;

  NetworkMonitorService(this._connectivityService) {
    _init();
  }

  Future<void> _init() async {
    _isOnline = await _connectivityService.isConnected;
    _subscription = _connectivityService.onConnectivityChanged.listen((isOnline) {
      _isOnline = isOnline;
    });
  }

  bool get isOnline => _isOnline;
  bool get isOffline => !_isOnline;

  void dispose() {
    _subscription?.cancel();
  }
}
