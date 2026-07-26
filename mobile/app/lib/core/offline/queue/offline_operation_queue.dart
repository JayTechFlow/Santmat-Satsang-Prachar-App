import '../models/offline_operation.dart';

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
