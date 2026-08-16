import '../manager/sync_manager.dart';
import '../scheduler/sync_scheduler.dart';
import '../bridge/connectivity_sync_bridge.dart';

class SyncCoordinator {
  final SyncManager syncManager;
  final SyncScheduler syncScheduler;
  final ConnectivitySyncBridge connectivityBridge;

  SyncCoordinator({
    required this.syncManager,
    required this.syncScheduler,
    required this.connectivityBridge,
  });

  void start() {
    // Starts scheduled syncing based on defined policies
  }

  void stop() {
    syncScheduler.cancel();
  }

  Future<void> forceSync() async {
    await syncManager.synchronize();
  }
}
