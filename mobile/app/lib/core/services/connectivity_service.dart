import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity? _connectivityOverride;

  ConnectivityService({Connectivity? connectivity}) 
      : _connectivityOverride = connectivity;

  Connectivity get _connectivity => _connectivityOverride ?? Connectivity();

  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return !result.contains(ConnectivityResult.none);
  }

  Stream<bool> get onConnectivityChanged {
    return _connectivity.onConnectivityChanged.map((results) {
      return !results.contains(ConnectivityResult.none);
    });
  }
}
