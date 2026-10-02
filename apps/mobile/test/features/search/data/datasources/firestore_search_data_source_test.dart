import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/services/firestore_service.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/firestore_search_data_source.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_result_entity.dart';

import '../../../../helpers/search_fixtures.dart';

/// Groups C, D and E — category filtering, query+category combination and
/// Unicode/Hindi matching, all executed against the *real* search pipeline
/// (no Firestore I/O: the published audio list is passed in directly).
void main() {
  final dataSource = FirestoreSearchDataSource(
    FirestoreService(firestore: null),
  );

  AudioCategoryEntity cat(String id, String name) =>
      AudioCategoryEntity(id: id, name: name);

  AudioEntity audio({
    required String id,
    String title = 'प्रभु से प्रीत लगाई रे',
    String speaker = 'गुरु वाणी',
    AudioCategoryEntity category =
        const AudioCategoryEntity(id: 'shahi_bhajanavali', name: 'शाही भजनावली'),
    String description = '',
    String? lyrics,
  }) {
    return AudioEntity(
      id: id,
      title: title,
      subtitle: '',
      description: description,
      speaker: speaker,
      category: category,
      duration: const Duration(seconds: 240),
      language: 'hindi',
      thumbnailUrl: '',
      artworkUrl: '',
      releaseDate: DateTime(2024, 1, 1),
      playCount: 0,
      favoriteCount: 0,
      isFeatured: false,
      isRecentlyAdded: false,
      isPopular: false,
      audioUrl: '',
      lyrics: lyrics,
    );
  }

  List<String> idsOf(List<SearchResultEntity> results) =>
      results.map((r) => r.id).toList()..sort();

  group('C — category filtering with an empty query', () {
    test('सभी भजन applies no restriction and returns every published bhajan',
        () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
      );
      expect(idsOf(results), [
        'aarti-1',
        'padavali-1',
        'padavali-2',
        'shahi-1',
        'shahi-2',
        'swagat-1',
      ]);
    });

    test('शाही भजनवाली returns only the production शाही भजनावली rows', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.shahiBhajanavali,
      );
      expect(idsOf(results), ['shahi-1', 'shahi-2']);
    });

    test('पदावली भजन returns only the production पदावली भजन rows', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.padavaliBhajan,
      );
      expect(idsOf(results), ['padavali-1', 'padavali-2']);
    });

    test('स्वागत गीत returns only the production स्वागत गीत rows', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.swagatGeet,
      );
      expect(idsOf(results), ['swagat-1']);
    });

    test('the ALL sentinel never filters by a Firestore category value', () {
      // The production dataset contains no "सभी भजन" category value at all;
      // ALL must still return everything.
      expect(
        searchPublishedBhajans
            .any((a) => a.category.name == SearchCategories.allBhajan.uiLabel),
        isFalse,
      );
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.allBhajan,
      );
      expect(results, hasLength(searchPublishedBhajans.length));
    });

    test('ALL and "no category" are equivalent', () {
      final withSentinel = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.allBhajan,
      );
      final withoutFilter = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
      );
      expect(idsOf(withSentinel), idsOf(withoutFilter));
    });
  });

  group('D — query combined with category', () {
    test('पदावली भजन + "गुरु" returns only matching पदावली rows', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: 'गुरु',
        category: SearchCategories.padavaliBhajan,
      );
      expect(idsOf(results), ['padavali-2']);
    });

    test('सभी भजन + "गुरु" searches across all supported published bhajans', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: 'गुरु',
        category: SearchCategories.allBhajan,
      );
      expect(idsOf(results), ['padavali-2', 'shahi-1', 'shahi-2']);
    });

    test('शाही भजनवाली + "गुरु" never leaks पदावली matches', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: 'गुरु',
        category: SearchCategories.shahiBhajanavali,
      );
      expect(idsOf(results), ['shahi-1', 'shahi-2']);
    });

    test('शाही भजनवाली + "xyz" yields the empty result set', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: 'xyz',
        category: SearchCategories.shahiBhajanavali,
      );
      expect(results, isEmpty);
    });

    test('a query inside one category cannot match another category', () {
      // "स्वागत गीत" exists only in the स्वागत गीत category.
      expect(
        dataSource
            .searchPublishedAudio(
              searchPublishedBhajans,
              query: 'स्वागत',
              category: SearchCategories.shahiBhajanavali,
            )
            .isEmpty,
        isTrue,
      );
      expect(
        idsOf(
          dataSource.searchPublishedAudio(
            searchPublishedBhajans,
            query: 'स्वागत',
            category: SearchCategories.swagatGeet,
          ),
        ),
        ['swagat-1'],
      );
    });

    test('an empty query inside a category returns that whole category', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.shahiBhajanavali,
      );
      expect(results, hasLength(2));
    });

    test('multi-token queries match only when every token is present', () {
      // Both शाही titles contain "गुरु" and "सेवा", so both must match.
      expect(
        idsOf(
          dataSource.searchPublishedAudio(
            searchPublishedBhajans,
            query: 'गुरु सेवा',
            category: SearchCategories.shahiBhajanavali,
          ),
        ),
        ['shahi-1', 'shahi-2'],
      );

      // "कुंज" exists only in shahi-2, so requiring *every* token narrows it.
      expect(
        idsOf(
          dataSource.searchPublishedAudio(
            searchPublishedBhajans,
            query: 'गुरु सेवा कुंज',
            category: SearchCategories.shahiBhajanavali,
          ),
        ),
        ['shahi-2'],
      );

      // A token that exists nowhere removes the row from the result set.
      expect(
        idsOf(
          dataSource.searchPublishedAudio(
            searchPublishedBhajans,
            query: 'गुरु सेवा अज्ञातशब्द',
            category: SearchCategories.shahiBhajanavali,
          ),
        ),
        isEmpty,
      );
    });

    test('no duplicate results are ever emitted', () {
      final duplicated = <AudioEntity>[
        ...searchPublishedBhajans,
        searchPublishedBhajans.first,
        searchPublishedBhajans[2],
      ];
      final results = dataSource.searchPublishedAudio(
        duplicated,
        query: '',
        category: SearchCategories.allBhajan,
      );
      expect(idsOf(results), hasLength(searchPublishedBhajans.length));
      expect(
        results.map((r) => r.id).toSet().length,
        results.length,
        reason: 'result ids must be unique',
      );
    });
  });

  group('E — Unicode / Hindi matching', () {
    test('Hindi token matches inside a Devanagari title', () {
      expect(dataSource.matchesSearchQuery(audio(id: 'a1'), 'प्रभु'), isTrue);
      expect(
        dataSource.matchesSearchQuery(audio(id: 'a2'), 'प्रभु प्रीत'),
        isTrue,
      );
      expect(dataSource.matchesSearchQuery(audio(id: 'a3'), 'राम'), isFalse);
    });

    test('query matches speaker and lyrics fields', () {
      expect(
        dataSource.matchesSearchQuery(
          audio(id: 'a1', speaker: 'संत कबीर'),
          'कबीर',
        ),
        isTrue,
      );
      expect(
        dataSource.matchesSearchQuery(
          audio(id: 'a2', lyrics: 'गुरु के दरबार में'),
          'दरबार',
        ),
        isTrue,
      );
    });

    test('query matches description field', () {
      expect(
        dataSource.matchesSearchQuery(
          audio(id: 'a1', description: 'संध्या आरती का संग्रह'),
          'संध्या',
        ),
        isTrue,
      );
    });

    test('empty query matches everything', () {
      expect(dataSource.matchesSearchQuery(audio(id: 'a1'), ''), isTrue);
    });

    test('Hindi token does not match a Latin-only title', () {
      expect(
        dataSource.matchesSearchQuery(
          audio(id: 'a1', title: 'Morning Prayer'),
          'प्रभु',
        ),
        isFalse,
      );
    });

    test('surrounding and repeated whitespace is tolerated', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '  गुरु   चरणन  ',
        category: SearchCategories.shahiBhajanavali,
      );
      expect(idsOf(results), ['shahi-1']);
    });

    test('Hindi category values match through the pipeline, not just units',
        () {
      final withHindiName = <AudioEntity>[
        audio(id: 'h1', category: cat('शाही भजनावली', 'शाही भजनावली')),
      ];
      final results = dataSource.searchPublishedAudio(
        withHindiName,
        query: '',
        category: SearchCategories.shahiBhajanavali,
      );
      expect(idsOf(results), ['h1']);
    });

    test('Latin transliteration of stored text still matches case-insensitively',
        () {
      final latin = <AudioEntity>[
        audio(id: 'l1', title: 'Maharshi Mehi Padavali'),
      ];
      final results = dataSource.searchPublishedAudio(
        latin,
        query: 'padavali',
      );
      expect(idsOf(results), ['l1']);
    });
  });

  group('L — pre-existing mapping/ranking regression', () {
    test('result maps audio to a verifiable /audio/details deep link', () {
      final result = dataSource.searchResultFromAudio(
        audio(
          id: 'bhajan-42',
          speaker: 'संत कबीर',
          category: cat('पदावली', 'पदावली भजन'),
        ),
        'प्रभु',
      );

      expect(result.type, SearchContentType.audio);
      expect(result.routePath, '/audio/details/bhajan-42');
      expect(result.id, 'bhajan-42');
      expect(result.title, 'प्रभु से प्रीत लगाई रे');
      expect(result.subtitle, 'पदावली भजन • संत कबीर');
      expect(result.tags, contains('पदावली भजन'));
      expect(result.tags, contains('संत कबीर'));
      expect(result.tags, contains('प्रभु'));
    });

    test('empty category name falls back to "भजन" without speaker', () {
      final result = dataSource.searchResultFromAudio(
        audio(
          id: 'x',
          category: AudioCategoryEntity(id: '', name: ''),
          speaker: '',
        ),
        '',
      );
      expect(result.subtitle, 'भजन');
      expect(result.routePath, '/audio/details/x');
    });

    test('title hits rank before subtitle hits', () {
      final titleHit = dataSource.searchResultFromAudio(
        audio(id: 't', title: 'राम स्मरण'),
        'राम',
      );
      final subtitleHit = dataSource.searchResultFromAudio(
        audio(id: 's', title: 'अमुक', speaker: 'राम कीर्तन'),
        'राम',
      );
      expect(
        dataSource.rankSearchResult(titleHit, 'राम'),
        lessThan(dataSource.rankSearchResult(subtitleHit, 'राम')),
      );
    });

    test('every mapped result carries the resolved audio entity for the queue',
        () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.swagatGeet,
      );
      expect(results, hasLength(1));
      expect(results.single.audio, isNotNull);
      expect(results.single.audio!.id, 'swagat-1');
    });

    test('audio entities keep their production category untouched', () {
      final results = dataSource.searchPublishedAudio(
        searchPublishedBhajans,
        query: '',
        category: SearchCategories.shahiBhajanavali,
      );
      // The canonical production value stays "शाही भजनावली" — the Search layer
      // maps onto it and never rewrites stored data.
      for (final result in results) {
        expect(result.audio!.category.name, 'शाही भजनावली');
        expect(result.audio!.category.id, 'shahi_bhajanavali');
      }
    });

    test('K — duplicate audio entities are deduplicated by id', () {
      final duplicates = [
        ...searchPublishedBhajans,
        ...searchPublishedBhajans,
      ];
      final results = dataSource.searchPublishedAudio(
        duplicates,
        query: '',
      );
      expect(results.length, equals(searchPublishedBhajans.length));
      final ids = results.map((r) => r.id).toSet();
      expect(ids.length, equals(results.length));
    });
  });
}