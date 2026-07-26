class SyncTask {
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
