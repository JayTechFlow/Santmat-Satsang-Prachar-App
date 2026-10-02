import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';

/// Group A — category model tests.
///
/// The four permanent system categories, their exact labels, their exact order
/// and their canonical production mapping are the contract. Nothing else in the
/// app is allowed to invent a fifth label or reorder them.
void main() {
  AudioCategoryEntity cat(String id, String name) =>
      AudioCategoryEntity(id: id, name: name);

  group('A1 — exact four labels and exact order', () {
    test('registry holds exactly the four product categories', () {
      expect(SearchCategories.all, hasLength(4));
      expect(
        SearchCategories.uiLabels,
        <String>['सभी भजन', 'शाही भजनवाली', 'पदावली भजन', 'स्वागत गीत'],
      );
    });

    test('order values are 0..3 and match list position', () {
      for (var i = 0; i < SearchCategories.all.length; i++) {
        expect(SearchCategories.all[i].order, i);
      }
      expect(SearchCategories.ids, <SearchCategoryId>[
        SearchCategoryId.allBhajan,
        SearchCategoryId.shahiBhajanavali,
        SearchCategoryId.padavaliBhajan,
        SearchCategoryId.swagatGeet,
      ]);
    });

    test('the product label is not the "सही भजनावली" variant', () {
      expect(SearchCategories.shahiBhajanavali.uiLabel, 'शाही भजनवाली');
      expect(SearchCategories.shahiBhajanavali.uiLabel, isNot('सही भजनावली'));
      expect(SearchCategories.uiLabels, isNot(contains('सही भजनावली')));
    });
  });

  group('A2 — permanent / system classification', () {
    test('every category is a permanent system category', () {
      for (final category in SearchCategories.all) {
        expect(category.isSystemCategory, isTrue);
      }
    });

    test('registry is unmodifiable — no custom categories can be appended', () {
      expect(() => SearchCategories.all.add(SearchCategories.allBhajan),
          throwsUnsupportedError);
    });

    test('exactly one ALL sentinel exists and it is the default', () {
      final sentinels = SearchCategories.all
          .where((category) => category.isAllSentinel)
          .toList();
      expect(sentinels, hasLength(1));
      expect(sentinels.single.id, SearchCategoryId.allBhajan);
      expect(SearchCategories.defaultCategory.id, SearchCategoryId.allBhajan);
      expect(SearchCategories.defaultCategory.uiLabel, 'सभी भजन');
    });
  });

  group('A3 — canonical production mapping is preserved', () {
    test('शाही भजनवाली maps to the existing "शाही भजनावली" data value', () {
      expect(
        SearchCategories.shahiBhajanavali.canonicalDataValues,
        contains('शाही भजनावली'),
      );
      expect(
        SearchCategories.shahiBhajanavali.matches(cat('bhajan', 'शाही भजनावली')),
        isTrue,
      );
    });

    test('पदावली भजन maps to the existing "पदावली भजन" data value', () {
      expect(
        SearchCategories.padavaliBhajan.canonicalDataValues,
        contains('पदावली भजन'),
      );
      expect(
        SearchCategories.padavaliBhajan.matches(cat('padavali', 'पदावली भजन')),
        isTrue,
      );
    });

    test('स्वागत गीत maps to the existing "स्वागत गीत" data value', () {
      expect(
        SearchCategories.swagatGeet.canonicalDataValues,
        contains('स्वागत गीत'),
      );
      expect(
        SearchCategories.swagatGeet.matches(cat('swagat', 'स्वागत गीत')),
        isTrue,
      );
    });

    test('ALL sentinel has no production values and applies no restriction',
        () {
      expect(SearchCategories.allBhajan.canonicalDataValues, isEmpty);
      expect(SearchCategories.allBhajan.matches(cat('aarti', 'आरती')), isTrue);
      expect(SearchCategories.allBhajan.matches(cat('', '')), isTrue);
      expect(SearchCategories.allBhajan.matches(null), isTrue);
    });
  });

  group('A4 — centralized matching is reusable and strict', () {
    test('a category never leaks into another category', () {
      final shahi = cat('shahi_bhajanavali', 'शाही भजनावली');
      expect(SearchCategories.padavaliBhajan.matches(shahi), isFalse);
      expect(SearchCategories.swagatGeet.matches(shahi), isFalse);

      final padavali = cat('padavali_bhajan', 'पदावली भजन');
      expect(SearchCategories.shahiBhajanavali.matches(padavali), isFalse);
      expect(SearchCategories.swagatGeet.matches(padavali), isFalse);

      final swagat = cat('swagat_geet', 'स्वागत गीत');
      expect(SearchCategories.shahiBhajanavali.matches(swagat), isFalse);
      expect(SearchCategories.padavaliBhajan.matches(swagat), isFalse);
    });

    test('an unrelated production category matches no specific category', () {
      final aarti = cat('aarti', 'आरती');
      for (final category in SearchCategories.all.where(
        (c) => !c.isAllSentinel,
      )) {
        expect(category.matches(aarti), isFalse, reason: category.uiLabel);
      }
    });

    test('a missing category matches no specific category', () {
      final empty = cat('', '');
      for (final category in SearchCategories.all.where(
        (c) => !c.isAllSentinel,
      )) {
        expect(category.matches(empty), isFalse, reason: category.uiLabel);
        expect(category.matches(null), isFalse, reason: category.uiLabel);
      }
    });

    test('matching is Unicode/whitespace tolerant but still category-scoped', () {
      expect(
        SearchCategories.shahiBhajanavali.matches(cat('x', '  शाही   भजनावली ')),
        isTrue,
      );
      expect(
        SearchCategories.padavaliBhajan.matches(cat('x', 'पदावली भजन')),
        isTrue,
      );
    });
  });

  group('A5 — lookups by label and id', () {
    test('byUiLabel resolves each exact product label', () {
      expect(
        SearchCategories.byUiLabel('सभी भजन')?.id,
        SearchCategoryId.allBhajan,
      );
      expect(
        SearchCategories.byUiLabel('शाही भजनवाली')?.id,
        SearchCategoryId.shahiBhajanavali,
      );
      expect(
        SearchCategories.byUiLabel('पदावली भजन')?.id,
        SearchCategoryId.padavaliBhajan,
      );
      expect(
        SearchCategories.byUiLabel('स्वागत गीत')?.id,
        SearchCategoryId.swagatGeet,
      );
    });

    test('unknown or empty labels resolve to null', () {
      expect(SearchCategories.byUiLabel('आरती'), isNull);
      expect(SearchCategories.byUiLabel(''), isNull);
      expect(SearchCategories.byUiLabel('   '), isNull);
    });

    test('byId round-trips every registered id', () {
      for (final category in SearchCategories.all) {
        expect(SearchCategories.byId(category.id), same(category));
      }
    });
  });
}