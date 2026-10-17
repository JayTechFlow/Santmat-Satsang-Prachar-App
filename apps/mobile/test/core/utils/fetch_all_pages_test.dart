import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/fetch_all_pages.dart';

/// Serves [items] in pages of [pageSize], mimicking a cursor-paginated
/// Firestore query that can only return one page per request.
class _FakePagedSource {
  _FakePagedSource(this.items, this.pageSize);

  final List<String> items;
  final int pageSize;
  final List<Object?> cursorsRequested = [];

  Future<FetchPage<String, int>> fetch(Object? cursor) async {
    cursorsRequested.add(cursor);
    final start = (cursor as int?) ?? 0;
    final end = (start + pageSize).clamp(0, items.length);
    final page = items.sublist(start, end);
    return FetchPage(items: page, nextCursor: page.isEmpty ? null : end);
  }
}

void main() {
  // The production defect: a single Firestore page capped the catalogue at 10
  // of 50 published tracks. The helper must walk every page instead.
  test('returns all 50 items across pages instead of the first page only', () async {
    final items = List.generate(50, (i) => 'track-${i + 1}');
    final source = _FakePagedSource(items, 30);

    final result = await fetchAllPages<String, int>(
      fetchPage: source.fetch,
      pageSize: 30,
    );

    expect(result, hasLength(50));
    expect(result, orderedEquals(items));
    expect(source.cursorsRequested, [null, 30]);
  });

  test('preserves query order (newest first) across page boundaries', () async {
    final items = List.generate(25, (i) => 'track-${24 - i}');
    final source = _FakePagedSource(items, 10);

    final result = await fetchAllPages<String, int>(
      fetchPage: source.fetch,
      pageSize: 10,
    );

    expect(result, orderedEquals(items));
  });

  test('handles an exact page-size boundary without dropping items', () async {
    final items = List.generate(60, (i) => 'track-${i + 1}');
    final source = _FakePagedSource(items, 30);

    final result = await fetchAllPages<String, int>(
      fetchPage: source.fetch,
      pageSize: 30,
    );

    expect(result, hasLength(60));
    // 30 + 30 (both full) then a final empty page confirms the end.
    expect(source.cursorsRequested, [null, 30, 60]);
  });

  test('returns an empty list when the first page is empty', () async {
    final source = _FakePagedSource(const [], 30);

    final result = await fetchAllPages<String, int>(
      fetchPage: source.fetch,
      pageSize: 30,
    );

    expect(result, isEmpty);
    expect(source.cursorsRequested, [null]);
  });

  test('stops when a full page cannot provide a next cursor', () async {
    var calls = 0;
    final result = await fetchAllPages<String, int>(
      fetchPage: (cursor) async {
        calls++;
        return FetchPage(
          items: List.generate(10, (i) => 'track-$i'),
          nextCursor: null,
        );
      },
      pageSize: 10,
    );

    expect(result, hasLength(10));
    expect(calls, 1);
  });

  test('propagates fetch errors to the caller', () async {
    expect(
      () => fetchAllPages<String, int>(
        fetchPage: (cursor) async => throw Exception('permission denied'),
        pageSize: 10,
      ),
      throwsA(isA<Exception>()),
    );
  });

  test('rejects a non-positive page size', () {
    expect(
      () => fetchAllPages<String, int>(
        fetchPage: (cursor) async => const FetchPage(items: []),
        pageSize: 0,
      ),
      throwsA(isA<ArgumentError>()),
    );
  });

  group('distinctBy — duplicate songs across concatenated pages are removed', () {
    test('keeps the first occurrence and preserves order', () {
      final items = [
        (id: 'a', title: 'भजन 1'),
        (id: 'b', title: 'भजन 2'),
        (id: 'a', title: 'भजन 1 (duplicate)'),
        (id: 'c', title: 'भजन 3'),
        (id: 'b', title: 'भजन 2 (duplicate)'),
      ];

      final result = distinctBy(items, (item) => item.id);

      expect(result, hasLength(3));
      expect(result.map((item) => item.id).toList(), ['a', 'b', 'c']);
      expect(result.first.title, 'भजन 1');
      expect(result.last.title, 'भजन 3');
    });

    test('an already-distinct list passes through unchanged', () {
      final items = List.generate(50, (i) => 'track-${i + 1}');
      expect(distinctBy(items, (id) => id), orderedEquals(items));
    });
  });
}
