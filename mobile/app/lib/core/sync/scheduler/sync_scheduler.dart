import 'dart:async';
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
        _timer = Timer.periodic(
          const Duration(minutes: 15),
          (_) => onSyncRequested(),
        );
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
