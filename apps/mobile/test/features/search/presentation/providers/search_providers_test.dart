import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/presentation/providers/search_providers.dart';

import '../../../../helpers/mock_search_data_source.dart';

/// Groups B, C, D — canonical Search state: default state, category switching
/// and query+category combination, driven through the real Riverpod notifier.
void main() {
  ProviderContainer makeContainer({
    MockSearchDataSource? dataSource,
  }) {
    final container = ProviderContainer(
      overrides: [
        searchDataSourceProvider.overrideWithValue(
          dataSource ??
              MockSearchDataSource(
                latency: Duration.zero,
              ),
        ),
      ],
    );
    addTearDown(container.dispose);
    return container;
  }

  /// Flushes the microtask queue used by the notifier/repository/use-case
  /// chain so assertions observe the completed search.
  Future<void> settle() async {
    for (var i = 0; i < 6; i++) {
      await Future<void>.delayed(Duration.zero);
    }
  }

  List<String> idsOf(ProviderContainer container) =>
      container.read(searchProvider).results.map((r) => r.id).toList()..sort();

  test('B — opening Search selects the "सभी भजन" ALL sentinel', () {
    final container = makeContainer();
    expect(
      container.read(searchProvider).selectedCategory,
      SearchCategoryId.allBhajan,
    );
    expect(container.read(searchProvider).selectedCategoryLabel, 'सभी भजन');
  });

  test('B — opening Search loads all published songs immediately', () async {
    final container = makeContainer();
    container.read(searchProvider);
    await settle();

    expect(container.read(searchProvider).isLoading, isFalse);
    expect(container.read(searchProvider).error, isNull);
    expect(idsOf(container), [
      'aarti-1',
      'padavali-1',
      'padavali-2',
      'shahi-1',
      'shahi-2',
      'swagat-1',
    ]);
  });

  test('B — the initial load does not depend on the widget tree', () async {
    final container = makeContainer();
    // Reading the provider alone (no widget) must produce real results.
    container.read(searchProvider);
    await settle();
    expect(container.read(searchProvider).results, isNotEmpty);
  });

  group('C — category selection updates the result set immediately', () {
    test('शाही भजनवाली', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.shahiBhajanavali);
      await settle();
      expect(idsOf(container), ['shahi-1', 'shahi-2']);
    });

    test('पदावली भजन', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.padavaliBhajan);
      await settle();
      expect(idsOf(container), ['padavali-1', 'padavali-2']);
    });

    test('स्वागत गीत', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.swagatGeet);
      await settle();
      expect(idsOf(container), ['swagat-1']);
    });

    test('back to सभी भजन restores every published bhajan', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.swagatGeet);
      await settle();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.allBhajan);
      await settle();
      expect(idsOf(container), hasLength(6));
    });

    test('the active filter mirrors the selected category', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.shahiBhajanavali);
      await settle();
      expect(
        container.read(searchProvider).activeFilter?.searchCategory,
        SearchCategoryId.shahiBhajanavali,
      );
    });

    test('the ALL sentinel produces a filter with no category restriction',
        () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.allBhajan);
      await settle();
      expect(
        container.read(searchProvider).activeFilter?.searchCategory,
        isNull,
      );
    });

    test('repeated switching stays consistent', () async {
      final container = makeContainer();
      final notifier = container.read(searchProvider.notifier);
      for (var i = 0; i < 3; i++) {
        for (final category in SearchCategories.ids) {
          notifier.selectCategory(category);
          await settle();
        }
      }
      notifier.selectCategory(SearchCategoryId.allBhajan);
      await settle();
      expect(container.read(searchProvider).selectedCategory, SearchCategoryId.allBhajan);
      expect(idsOf(container), hasLength(6));
    });
  });

  group('D — query + category combination', () {
    test('category + query filters to the intersection', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.padavaliBhajan);
      await settle();

      await container
          .read(searchProvider.notifier)
          .runSearch('गुरु', category: SearchCategoryId.padavaliBhajan);

      expect(idsOf(container), ['padavali-2']);
    });

    test('ALL + query searches across every published bhajan', () async {
      final container = makeContainer();
      await container
          .read(searchProvider.notifier)
          .runSearch('गुरु', category: SearchCategoryId.allBhajan);
      expect(idsOf(container), ['padavali-2', 'shahi-1', 'shahi-2']);
    });

    test('no-match query yields an empty result set, not an error', () async {
      final container = makeContainer();
      await container.read(searchProvider.notifier).runSearch(
            'xyz',
            category: SearchCategoryId.shahiBhajanavali,
          );
      expect(container.read(searchProvider).results, isEmpty);
      expect(container.read(searchProvider).error, isNull);
    });

    test('clearing the query restores the full selected category', () async {
      final container = makeContainer();
      container
          .read(searchProvider.notifier)
          .selectCategory(SearchCategoryId.shahiBhajanavali);
      await settle();

      container.read(searchProvider.notifier).updateQuery('गुरु');
      await Future<void>.delayed(const Duration(milliseconds: 600));
      expect(container.read(searchProvider).query, 'गुरु');

      container.read(searchProvider.notifier).updateQuery('');
      await settle();
      expect(container.read(searchProvider).query, '');
      expect(idsOf(container), ['shahi-1', 'shahi-2']);
    });

    test('changing category does not clear the query', () async {
      final container = makeContainer();
      final notifier = container.read(searchProvider.notifier);
      await notifier.runSearch(
        'गुरु',
        category: SearchCategoryId.shahiBhajanavali,
      );
      expect(container.read(searchProvider).query, 'गुरु');

      notifier.selectCategory(SearchCategoryId.allBhajan);
      await settle();

      expect(container.read(searchProvider).query, 'गुरु');
      expect(idsOf(container), ['padavali-2', 'shahi-1', 'shahi-2']);
    });

    test('typing is debounced into a single search', () async {
      final dataSource = MockSearchDataSource(latency: Duration.zero);
      final container = makeContainer(dataSource: dataSource);
      final notifier = container.read(searchProvider.notifier);

      notifier
        ..updateQuery('गु')
        ..updateQuery('गुरु')
        ..updateQuery('गुरु ');
      await Future<void>.delayed(const Duration(milliseconds: 600));

      expect(container.read(searchProvider).query, 'गुरु ');
      expect(container.read(searchProvider).selectedCategory,
          SearchCategoryId.allBhajan);
      expect(idsOf(container), isNotEmpty);
    });

    test('a superseded request never overwrites newer results', () async {
      final container = makeContainer(
        dataSource: MockSearchDataSource(
          latency: const Duration(milliseconds: 30),
        ),
      );
      final notifier = container.read(searchProvider.notifier);

      final stale = notifier.runSearch(
        'गुरु',
        category: SearchCategoryId.allBhajan,
      );
      final fresh = notifier.runSearch(
        'स्वागत',
        category: SearchCategoryId.allBhajan,
      );
      await Future.wait([stale, fresh]);

      expect(container.read(searchProvider).query, 'स्वागत');
      expect(idsOf(container), ['swagat-1']);
    });
  });

  group('G/H — history and popular-search surface is gone', () {
    test('the canonical state carries only query/category/results/status', () async {
      final container = makeContainer();
      // Reaching this line at all proves the removed providers/fields no longer
      // exist: `recentSearchesProvider`, `popularSearchesProvider`,
      // `getRecentSearchesUseCaseProvider`, `getPopularSearchesUseCaseProvider`
      // and `SearchState.suggestions` were deleted from the codebase.
      container.read(searchProvider);
      await settle();
      final state = container.read(searchProvider);
      expect(state.query, '');
      expect(state.results, isNotEmpty);
      expect(state.error, isNull);
      expect(state.isLoading, isFalse);
    });
  });

  group('O — default load race condition protection', () {
    test('user category selection before microtask runs is never overwritten by default ALL load', () async {
      final container = makeContainer(
        dataSource: MockSearchDataSource(
          latency: const Duration(milliseconds: 20),
        ),
      );
      final notifier = container.read(searchProvider.notifier);

      // User immediately selects Shahi before the microtask runs
      notifier.selectCategory(SearchCategoryId.shahiBhajanavali);

      await Future<void>.delayed(const Duration(milliseconds: 60));
      await settle();

      expect(
        container.read(searchProvider).selectedCategory,
        SearchCategoryId.shahiBhajanavali,
      );
      expect(idsOf(container), ['shahi-1', 'shahi-2']);
    });

    test('stale default ALL load completing after user selection is discarded', () async {
      final container = makeContainer(
        dataSource: MockSearchDataSource(
          latency: const Duration(milliseconds: 40),
        ),
      );
      final notifier = container.read(searchProvider.notifier);

      // Let the microtask fire so default ALL load starts
      await Future<void>.delayed(const Duration(milliseconds: 5));

      // While default load is in-flight, user selects Padavali
      notifier.selectCategory(SearchCategoryId.padavaliBhajan);

      // Wait for both default load and Padavali load to finish
      await Future<void>.delayed(const Duration(milliseconds: 100));
      await settle();

      // Padavali MUST win: stale ALL results must NOT overwrite it
      expect(
        container.read(searchProvider).selectedCategory,
        SearchCategoryId.padavaliBhajan,
      );
      expect(idsOf(container), ['padavali-1', 'padavali-2']);
    });
  });
}