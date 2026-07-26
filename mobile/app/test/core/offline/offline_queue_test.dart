import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/offline/queue/offline_operation_queue.dart';
import 'package:santmat_satsang_prachar/core/offline/models/offline_operation.dart';

void main() {
  test('OfflineOperationQueue stores operations', () async {
    final queue = OfflineOperationQueue();
    await queue.enqueue(
      OfflineOperation(
        id: '1',
        target: 'tgt',
        action: 'act',
        payload: {},
        createdAt: DateTime.now(),
      ),
    );

    final op = await queue.dequeue();
    expect(op, isNotNull);
    expect(op?.id, '1');
  });
}
