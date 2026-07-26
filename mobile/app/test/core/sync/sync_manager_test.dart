import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/sync/manager/sync_manager.dart';
import 'package:santmat_satsang_prachar/core/sync/queue/sync_queue.dart';
import 'package:santmat_satsang_prachar/core/sync/conflict/conflict_resolver.dart';
import 'package:santmat_satsang_prachar/core/sync/models/sync_task.dart';

void main() {
  test('SyncManager processes tasks correctly', () async {
    final queue = SyncQueue();
    final resolver = ConflictResolver();
    final manager = SyncManager(queue: queue, conflictResolver: resolver);

    await queue.enqueue(
      SyncTask(
        id: '1',
        entityId: 'e1',
        collection: 'col',
        operation: 'update',
        data: {},
        timestamp: DateTime.now(),
      ),
    );

    final result = await manager.synchronize();
    expect(result.isSuccess, isTrue);
    expect(result.itemsSynced, 1);
  });
}
