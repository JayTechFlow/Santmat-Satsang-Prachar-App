import '../models/sync_task.dart';
import '../models/sync_result.dart';
import '../queue/sync_queue.dart';
import '../conflict/conflict_resolver.dart';

class SyncManager {
  final SyncQueue queue;
  final ConflictResolver conflictResolver;
  bool _isSyncing = false;

  SyncManager({required this.queue, required this.conflictResolver});

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
