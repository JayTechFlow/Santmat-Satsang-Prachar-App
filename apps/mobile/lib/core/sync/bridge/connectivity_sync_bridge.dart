import 'dart:async';
import '../../services/connectivity_service.dart';
import '../manager/sync_manager.dart';

class ConnectivitySyncBridge {
  final ConnectivityService connectivityService;
  final SyncManager syncManager;
  StreamSubscription? _subscription;

  ConnectivitySyncBridge({
    required this.connectivityService,
    required this.syncManager,
  }) {
    _init();
  }

  void _init() {
    _subscription = connectivityService.onConnectivityChanged.listen((
      isOnline,
    ) {
      if (isOnline) {
        syncManager.synchronize();
      }
    });
  }

  void dispose() {
    _subscription?.cancel();
  }
}
