import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'service_locator_registrations.dart';

import '../sync/conflict/conflict_resolver.dart';
import '../sync/queue/sync_queue.dart';
import '../sync/manager/sync_manager.dart';
import '../sync/scheduler/sync_scheduler.dart';
import '../sync/bridge/connectivity_sync_bridge.dart';
import '../sync/coordinator/sync_coordinator.dart';
import '../offline/queue/offline_operation_queue.dart';
import '../cache/manager/cache_manager.dart';
import '../cache/invalidator/cache_invalidator.dart';

final conflictResolverProvider = Provider<ConflictResolver>((ref) {
  return ConflictResolver();
});

final syncQueueProvider = Provider<SyncQueue>((ref) {
  return SyncQueue();
});

final syncManagerProvider = Provider<SyncManager>((ref) {
  return SyncManager(
    queue: ref.watch(syncQueueProvider),
    conflictResolver: ref.watch(conflictResolverProvider),
  );
});

final syncSchedulerProvider = Provider<SyncScheduler>((ref) {
  return SyncScheduler(
    onSyncRequested: () => ref.read(syncManagerProvider).synchronize(),
  );
});

final connectivitySyncBridgeProvider = Provider<ConnectivitySyncBridge>((ref) {
  final bridge = ConnectivitySyncBridge(
    connectivityService: ref.watch(connectivityServiceProvider),
    syncManager: ref.watch(syncManagerProvider),
  );
  ref.onDispose(() => bridge.dispose());
  return bridge;
});

final syncCoordinatorProvider = Provider<SyncCoordinator>((ref) {
  return SyncCoordinator(
    syncManager: ref.watch(syncManagerProvider),
    syncScheduler: ref.watch(syncSchedulerProvider),
    connectivityBridge: ref.watch(connectivitySyncBridgeProvider),
  );
});

final offlineOperationQueueProvider = Provider<OfflineOperationQueue>((ref) {
  return OfflineOperationQueue();
});

final cacheManagerProvider = Provider<CacheManager>((ref) {
  return InMemoryCacheManager();
});

final cacheInvalidatorProvider = Provider<CacheInvalidator>((ref) {
  return CacheInvalidator(ref.watch(cacheManagerProvider));
});
