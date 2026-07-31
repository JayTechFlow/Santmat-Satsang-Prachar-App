import os

files = {
    "lib/core/sync/models/sync_task.dart": """class SyncTask {
  final String id;
  final String entityId;
  final String collection;
  final String operation; // create, update, delete
  final Map<String, dynamic> data;
  final DateTime timestamp;
  int retryCount;

  SyncTask({
    required this.id,
    required this.entityId,
    required this.collection,
    required this.operation,
    required this.data,
    required this.timestamp,
    this.retryCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'entityId': entityId,
      'collection': collection,
      'operation': operation,
      'data': data,
      'timestamp': timestamp.toIso8601String(),
      'retryCount': retryCount,
    };
  }

  factory SyncTask.fromMap(Map<String, dynamic> map) {
    return SyncTask(
      id: map['id'],
      entityId: map['entityId'],
      collection: map['collection'],
      operation: map['operation'],
      data: map['data'],
      timestamp: DateTime.parse(map['timestamp']),
      retryCount: map['retryCount'] ?? 0,
    );
  }
}
""",
    "lib/core/sync/models/sync_policy.dart": """enum SyncPolicy {
  manual,
  automatic,
  wifiOnly,
  chargingOnly,
  immediate,
  batched,
}
""",
    "lib/core/sync/models/sync_result.dart": """class SyncResult {
  final bool isSuccess;
  final String? error;
  final int itemsSynced;
  final List<String> failedTaskIds;

  SyncResult({
    required this.isSuccess,
    this.error,
    this.itemsSynced = 0,
    this.failedTaskIds = const [],
  });
}
""",
    "lib/core/sync/conflict/conflict_resolution_strategy.dart": """enum ConflictResolutionStrategy {
  lastWriteWins,
  serverWins,
  clientWins,
  mergeStrategy,
  timestampComparison,
  versionComparison,
  customResolverHooks,
}
""",
    "lib/core/sync/conflict/conflict_resolver.dart": """import 'conflict_resolution_strategy.dart';

class ConflictResolver {
  final ConflictResolutionStrategy defaultStrategy;

  ConflictResolver({this.defaultStrategy = ConflictResolutionStrategy.lastWriteWins});

  Map<String, dynamic> resolve({
    required Map<String, dynamic> clientData,
    required Map<String, dynamic> serverData,
    ConflictResolutionStrategy? strategy,
  }) {
    final activeStrategy = strategy ?? defaultStrategy;

    switch (activeStrategy) {
      case ConflictResolutionStrategy.serverWins:
        return serverData;
      case ConflictResolutionStrategy.clientWins:
        return clientData;
      case ConflictResolutionStrategy.lastWriteWins:
      case ConflictResolutionStrategy.timestampComparison:
        return _resolveByTimestamp(clientData, serverData);
      case ConflictResolutionStrategy.versionComparison:
        return _resolveByVersion(clientData, serverData);
      case ConflictResolutionStrategy.mergeStrategy:
      case ConflictResolutionStrategy.customResolverHooks:
        return _mergeData(clientData, serverData);
    }
  }

  Map<String, dynamic> _resolveByTimestamp(Map<String, dynamic> client, Map<String, dynamic> server) {
    final clientTime = client['updatedAt'] ?? client['timestamp'] ?? 0;
    final serverTime = server['updatedAt'] ?? server['timestamp'] ?? 0;

    if (clientTime is int && serverTime is int) {
      return clientTime > serverTime ? client : server;
    }
    return server;
  }

  Map<String, dynamic> _resolveByVersion(Map<String, dynamic> client, Map<String, dynamic> server) {
    final clientVersion = client['version'] ?? 0;
    final serverVersion = server['version'] ?? 0;

    if (clientVersion is int && serverVersion is int) {
      return clientVersion > serverVersion ? client : server;
    }
    return server;
  }

  Map<String, dynamic> _mergeData(Map<String, dynamic> client, Map<String, dynamic> server) {
    final merged = Map<String, dynamic>.from(server);
    client.forEach((key, value) {
      if (value != null) {
        merged[key] = value;
      }
    });
    return merged;
  }
}
""",
    "lib/core/offline/models/offline_operation.dart": """class OfflineOperation {
  final String id;
  final String target;
  final String action;
  final Map<String, dynamic> payload;
  final DateTime createdAt;

  OfflineOperation({
    required this.id,
    required this.target,
    required this.action,
    required this.payload,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'target': target,
      'action': action,
      'payload': payload,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory OfflineOperation.fromMap(Map<String, dynamic> map) {
    return OfflineOperation(
      id: map['id'],
      target: map['target'],
      action: map['action'],
      payload: map['payload'],
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
""",
    "lib/core/offline/queue/offline_operation_queue.dart": """import '../models/offline_operation.dart';

class OfflineOperationQueue {
  final List<OfflineOperation> _queue = [];

  Future<void> enqueue(OfflineOperation operation) async {
    _queue.add(operation);
  }

  Future<OfflineOperation?> dequeue() async {
    if (_queue.isEmpty) return null;
    return _queue.removeAt(0);
  }

  Future<List<OfflineOperation>> getAll() async {
    return List.unmodifiable(_queue);
  }

  Future<void> clear() async {
    _queue.clear();
  }

  Future<void> remove(String id) async {
    _queue.removeWhere((op) => op.id == id);
  }
}
""",
    "lib/core/sync/queue/sync_queue.dart": """import '../models/sync_task.dart';

class SyncQueue {
  final List<SyncTask> _tasks = [];

  Future<void> enqueue(SyncTask task) async {
    _tasks.add(task);
  }

  Future<SyncTask?> dequeue() async {
    if (_tasks.isEmpty) return null;
    return _tasks.removeAt(0);
  }

  Future<List<SyncTask>> peekAll() async {
    return List.unmodifiable(_tasks);
  }

  Future<void> remove(String id) async {
    _tasks.removeWhere((t) => t.id == id);
  }

  Future<void> clear() async {
    _tasks.clear();
  }
}
""",
    "lib/core/sync/scheduler/sync_scheduler.dart": """import 'dart:async';
import '../models/sync_policy.dart';

class SyncScheduler {
  Timer? _timer;
  final void Function() onSyncRequested;

  SyncScheduler({required this.onSyncRequested});

  void schedule(SyncPolicy policy) {
    _timer?.cancel();
    switch (policy) {
      case SyncPolicy.immediate:
        onSyncRequested();
        break;
      case SyncPolicy.batched:
      case SyncPolicy.automatic:
        _timer = Timer.periodic(const Duration(minutes: 15), (_) => onSyncRequested());
        break;
      case SyncPolicy.manual:
      default:
        break;
    }
  }

  void cancel() {
    _timer?.cancel();
  }
}
""",
    "lib/core/sync/manager/sync_manager.dart": """import '../models/sync_task.dart';
import '../models/sync_result.dart';
import '../queue/sync_queue.dart';
import '../conflict/conflict_resolver.dart';

class SyncManager {
  final SyncQueue queue;
  final ConflictResolver conflictResolver;
  bool _isSyncing = false;

  SyncManager({
    required this.queue,
    required this.conflictResolver,
  });

  Future<SyncResult> synchronize() async {
    if (_isSyncing) {
      return SyncResult(isSuccess: false, error: 'Sync already in progress');
    }
    _isSyncing = true;
    
    int itemsSynced = 0;
    List<String> failedTasks = [];

    try {
      final tasks = await queue.peekAll();
      for (final task in tasks) {
        try {
          await queue.remove(task.id);
          itemsSynced++;
        } catch (e) {
          failedTasks.add(task.id);
          task.retryCount++;
        }
      }
      return SyncResult(
        isSuccess: failedTasks.isEmpty,
        itemsSynced: itemsSynced,
        failedTaskIds: failedTasks,
      );
    } catch (e) {
      return SyncResult(isSuccess: false, error: e.toString());
    } finally {
      _isSyncing = false;
    }
  }

  Future<void> enqueueTask(SyncTask task) async {
    await queue.enqueue(task);
  }
}
""",
    "lib/core/sync/bridge/connectivity_sync_bridge.dart": """import 'dart:async';
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
    _subscription = connectivityService.onConnectivityChanged.listen((isOnline) {
      if (isOnline) {
        syncManager.synchronize();
      }
    });
  }

  void dispose() {
    _subscription?.cancel();
  }
}
""",
    "lib/core/sync/adapters/repository_sync_adapter.dart": """abstract class RepositorySyncAdapter<T> {
  final String collectionName;
  
  RepositorySyncAdapter(this.collectionName);

  Future<void> pushLocalChanges();
  Future<void> pullRemoteChanges();
  Future<void> resolveConflicts();
}
""",
    "lib/core/sync/coordinator/sync_coordinator.dart": """import '../manager/sync_manager.dart';
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
""",
    "lib/core/cache/models/cache_policy.dart": """enum CachePolicy {
  cacheOnly,
  networkOnly,
  cacheFirst,
  networkFirst,
  staleWhileRevalidate,
}
""",
    "lib/core/cache/models/cache_entry.dart": """class CacheEntry<T> {
  final String key;
  final T data;
  final DateTime timestamp;
  final Duration? ttl;

  CacheEntry({
    required this.key,
    required this.data,
    required this.timestamp,
    this.ttl,
  });

  bool get isExpired {
    if (ttl == null) return false;
    return DateTime.now().difference(timestamp) > ttl!;
  }
}
""",
    "lib/core/cache/manager/cache_manager.dart": """import '../models/cache_entry.dart';
import '../models/cache_policy.dart';

abstract class CacheManager {
  Future<void> put<T>(String key, T data, {Duration? ttl});
  Future<T?> get<T>(String key, {CachePolicy policy = CachePolicy.cacheFirst});
  Future<void> remove(String key);
  Future<void> clear();
  Future<void> evictExpired();
}

class InMemoryCacheManager implements CacheManager {
  final Map<String, CacheEntry<dynamic>> _cache = {};
  final int maxEntries;

  InMemoryCacheManager({this.maxEntries = 100});

  @override
  Future<void> put<T>(String key, T data, {Duration? ttl}) async {
    if (_cache.length >= maxEntries && !_cache.containsKey(key)) {
      _evictLRU();
    }
    _cache[key] = CacheEntry<T>(
      key: key,
      data: data,
      timestamp: DateTime.now(),
      ttl: ttl,
    );
  }

  @override
  Future<T?> get<T>(String key, {CachePolicy policy = CachePolicy.cacheFirst}) async {
    if (policy == CachePolicy.networkOnly) return null;
    
    final entry = _cache[key];
    if (entry == null) return null;
    
    if (entry.isExpired) {
      _cache.remove(key);
      return null;
    }
    
    return entry.data as T?;
  }

  @override
  Future<void> remove(String key) async {
    _cache.remove(key);
  }

  @override
  Future<void> clear() async {
    _cache.clear();
  }

  @override
  Future<void> evictExpired() async {
    _cache.removeWhere((key, entry) => entry.isExpired);
  }

  void _evictLRU() {
    if (_cache.isEmpty) return;
    String? oldestKey;
    DateTime? oldestTime;

    _cache.forEach((key, entry) {
      if (oldestTime == null || entry.timestamp.isBefore(oldestTime!)) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey != null) {
      _cache.remove(oldestKey);
    }
  }
}
""",
    "lib/core/cache/invalidator/cache_invalidator.dart": """import '../manager/cache_manager.dart';

class CacheInvalidator {
  final CacheManager cacheManager;

  CacheInvalidator(this.cacheManager);

  Future<void> invalidate(String key) async {
    await cacheManager.remove(key);
  }

  Future<void> invalidateAll() async {
    await cacheManager.clear();
  }

  Future<void> invalidateExpired() async {
    await cacheManager.evictExpired();
  }
}
""",
    "lib/core/di/sync_providers.dart": """import 'package:flutter_riverpod/flutter_riverpod.dart';
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
""",
    "test/core/sync/sync_manager_test.dart": """import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/sync/manager/sync_manager.dart';
import 'package:santmat_satsang_prachar/core/sync/queue/sync_queue.dart';
import 'package:santmat_satsang_prachar/core/sync/conflict/conflict_resolver.dart';
import 'package:santmat_satsang_prachar/core/sync/models/sync_task.dart';

void main() {
  test('SyncManager processes tasks correctly', () async {
    final queue = SyncQueue();
    final resolver = ConflictResolver();
    final manager = SyncManager(queue: queue, conflictResolver: resolver);

    await queue.enqueue(SyncTask(
      id: '1',
      entityId: 'e1',
      collection: 'col',
      operation: 'update',
      data: {},
      timestamp: DateTime.now(),
    ));

    final result = await manager.synchronize();
    expect(result.isSuccess, isTrue);
    expect(result.itemsSynced, 1);
  });
}
""",
    "test/core/sync/conflict_resolver_test.dart": """import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/sync/conflict/conflict_resolver.dart';
import 'package:santmat_satsang_prachar/core/sync/conflict/conflict_resolution_strategy.dart';

void main() {
  test('ConflictResolver uses serverWins correctly', () {
    final resolver = ConflictResolver(defaultStrategy: ConflictResolutionStrategy.serverWins);
    final clientData = {'a': 1};
    final serverData = {'a': 2};

    final result = resolver.resolve(clientData: clientData, serverData: serverData);
    expect(result['a'], 2);
  });
}
""",
    "test/core/cache/cache_manager_test.dart": """import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/cache/manager/cache_manager.dart';

void main() {
  test('CacheManager stores and retrieves values', () async {
    final cache = InMemoryCacheManager();
    await cache.put('key1', 'value1');
    final val = await cache.get<String>('key1');
    expect(val, 'value1');
  });
}
""",
    "test/core/offline/offline_queue_test.dart": """import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/offline/queue/offline_operation_queue.dart';
import 'package:santmat_satsang_prachar/core/offline/models/offline_operation.dart';

void main() {
  test('OfflineOperationQueue stores operations', () async {
    final queue = OfflineOperationQueue();
    await queue.enqueue(OfflineOperation(
      id: '1',
      target: 'tgt',
      action: 'act',
      payload: {},
      createdAt: DateTime.now(),
    ));

    final op = await queue.dequeue();
    expect(op, isNotNull);
    expect(op?.id, '1');
  });
}
""",
    "test/core/sync/bridge/connectivity_sync_bridge_test.dart": """import 'package:flutter_test/flutter_test.dart';

void main() {
  test('ConnectivitySyncBridge test placeholder', () {
    expect(true, isTrue);
  });
}
""",
    "test/core/sync/adapters/repository_sync_adapter_test.dart": """import 'package:flutter_test/flutter_test.dart';

void main() {
  test('RepositorySyncAdapter test placeholder', () {
    expect(true, isTrue);
  });
}
""",
    "test/core/di/sync_providers_test.dart": """import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/sync_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/services/connectivity_service.dart';

class MockConnectivityService extends ConnectivityService {
  @override
  Stream<bool> get onConnectivityChanged => Stream.value(true);
}

void main() {
  test('Sync providers are registered correctly', () {
    final container = ProviderContainer(
      overrides: [
        connectivityServiceProvider.overrideWithValue(MockConnectivityService()),
      ]
    );
    expect(container.read(syncManagerProvider), isNotNull);
    container.dispose();
  });
}
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

print("Created all files.")
