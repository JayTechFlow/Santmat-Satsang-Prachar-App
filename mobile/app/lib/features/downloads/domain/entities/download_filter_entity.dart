class DownloadFilterEntity {
  final String? contentType;
  final String? status;
  final String? categoryId;
  final String? sort; // 'newest', 'oldest', 'largest', 'smallest'
  final String? searchQuery;

  const DownloadFilterEntity({
    this.contentType,
    this.status,
    this.categoryId,
    this.sort,
    this.searchQuery,
  });
}
