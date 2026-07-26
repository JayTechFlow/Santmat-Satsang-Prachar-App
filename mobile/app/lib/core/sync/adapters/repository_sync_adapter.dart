abstract class RepositorySyncAdapter<T> {
  final String collectionName;

  RepositorySyncAdapter(this.collectionName);

  Future<void> pushLocalChanges();
  Future<void> pullRemoteChanges();
  Future<void> resolveConflicts();
}
