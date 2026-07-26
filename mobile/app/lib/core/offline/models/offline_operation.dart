class OfflineOperation {
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
