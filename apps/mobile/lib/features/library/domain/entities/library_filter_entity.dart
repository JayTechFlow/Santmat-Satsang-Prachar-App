class LibraryFilterEntity {
  final String? contentType;
  final String? category;
  final String? sort; // 'recent', 'oldest', 'a-z'
  final bool? isCompleted;
  final bool? inProgress;

  const LibraryFilterEntity({
    this.contentType,
    this.category,
    this.sort,
    this.isCompleted,
    this.inProgress,
  });
}
