/// One page produced by the fetch callback of [fetchAllPages].
class FetchPage<T, C> {
  const FetchPage({required this.items, this.nextCursor});

  /// Items of this page, in query order. At most `pageSize` entries.
  final List<T> items;

  /// Opaque cursor identifying the last item of this page.
  ///
  /// Passed back as the cursor of the next fetch. Null when the page is empty.
  final C? nextCursor;
}

/// Fetches a complete result set from a cursor-paginated query.
///
/// [fetchPage] must return at most [pageSize] items per call. Pages are
/// requested repeatedly — starting from [cursor] — until a page returns fewer
/// than [pageSize] items, which signals the end of the data set. Items are
/// accumulated in query order, so the caller receives the whole result set
/// instead of the first hard-limited page.
Future<List<T>> fetchAllPages<T, C>({
  required Future<FetchPage<T, C>> Function(C? cursor) fetchPage,
  required int pageSize,
  C? cursor,
}) async {
  if (pageSize <= 0) {
    throw ArgumentError.value(pageSize, 'pageSize', 'must be greater than 0');
  }

  final items = <T>[];
  C? nextCursor = cursor;

  while (true) {
    final page = await fetchPage(nextCursor);
    items.addAll(page.items);
    if (page.items.length < pageSize) break;
    // A full page without a next cursor cannot be paginated further.
    if (page.nextCursor == null) break;
    nextCursor = page.nextCursor;
  }

  return items;
}

/// Returns [items] with duplicates removed, keeping the first occurrence.
///
/// Concatenating cursor-paginated pages can surface the same entity twice when
/// its sort key (e.g. `createdAt`) changes between two page requests. Keying by
/// document id keeps the combined catalogue free of duplicate songs while
/// preserving query order.
List<T> distinctBy<T, K>(Iterable<T> items, K Function(T) key) {
  final seen = <K>{};
  return items.where((item) => seen.add(key(item))).toList();
}
