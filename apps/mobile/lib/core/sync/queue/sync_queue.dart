import '../models/sync_task.dart';

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
