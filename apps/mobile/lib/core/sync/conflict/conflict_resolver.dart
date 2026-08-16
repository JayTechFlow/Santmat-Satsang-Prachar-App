import 'conflict_resolution_strategy.dart';

class ConflictResolver {
  final ConflictResolutionStrategy defaultStrategy;

  ConflictResolver({
    this.defaultStrategy = ConflictResolutionStrategy.lastWriteWins,
  });

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

  Map<String, dynamic> _resolveByTimestamp(
    Map<String, dynamic> client,
    Map<String, dynamic> server,
  ) {
    final clientTime = client['updatedAt'] ?? client['timestamp'] ?? 0;
    final serverTime = server['updatedAt'] ?? server['timestamp'] ?? 0;

    if (clientTime is int && serverTime is int) {
      return clientTime > serverTime ? client : server;
    }
    return server;
  }

  Map<String, dynamic> _resolveByVersion(
    Map<String, dynamic> client,
    Map<String, dynamic> server,
  ) {
    final clientVersion = client['version'] ?? 0;
    final serverVersion = server['version'] ?? 0;

    if (clientVersion is int && serverVersion is int) {
      return clientVersion > serverVersion ? client : server;
    }
    return server;
  }

  Map<String, dynamic> _mergeData(
    Map<String, dynamic> client,
    Map<String, dynamic> server,
  ) {
    final merged = Map<String, dynamic>.from(server);
    client.forEach((key, value) {
      if (value != null) {
        merged[key] = value;
      }
    });
    return merged;
  }
}
