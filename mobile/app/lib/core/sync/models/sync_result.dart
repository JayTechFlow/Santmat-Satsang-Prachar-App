class SyncResult {
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
