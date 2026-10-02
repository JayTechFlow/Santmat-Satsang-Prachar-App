import '../../../../features/audio/domain/entities/audio_category_entity.dart';
import '../utils/search_text_utils.dart';

/// Stable identifier for a Search category.
///
/// This is the value carried through state, filters and widgets. UI labels and
/// production Firestore category values are *never* carried around as raw
/// strings — both are resolved through [SearchCategories].
enum SearchCategoryId {
  /// Sentinel meaning "no category restriction". Never a Firestore value.
  allBhajan,
  shahiBhajanavali,
  padavaliBhajan,
  swagatGeet,
}

/// Immutable definition of one Search category.
///
/// [uiLabel] is the exact product label shown to users. [canonicalDataValues]
/// are the existing production Firestore category values, preserved verbatim —
/// the Search layer maps onto them and never rewrites the underlying data.
/// [matchTokens] are normalized substrings that make matching robust to the id
/// versus name fields of a stored document, so a single definition owns the
/// whole compatibility surface.
class SearchCategoryDefinition {
  final SearchCategoryId id;

  /// Exact label rendered in the UI. Must never be reworded.
  final String uiLabel;

  /// Existing production category values this category resolves to.
  final List<String> canonicalDataValues;

  /// Normalized fragments identifying this category inside stored values.
  final List<String> matchTokens;

  /// Position in the permanent category row. Fixed by the product.
  final int order;

  const SearchCategoryDefinition({
    required this.id,
    required this.uiLabel,
    required this.canonicalDataValues,
    required this.matchTokens,
    required this.order,
  });

  /// Every Search category is a permanent, non-removable system category.
  bool get isSystemCategory => true;

  /// The ALL sentinel: applies no category restriction at all.
  ///
  /// It is a UI/filter concept only. Production data is never queried for a
  /// document whose category equals the ALL label.
  bool get isAllSentinel => id == SearchCategoryId.allBhajan;

  /// Whether [category] (from production data) belongs to this category.
  bool matches(AudioCategoryEntity? category) {
    if (isAllSentinel) return true;
    if (category == null) return false;
    return matchesValues(<String?>[category.id, category.name]);
  }

  /// Whether any of [rawValues] resolves to this category.
  ///
  /// Empty/absent values never match, so an unfiltered-but-missing category
  /// cannot leak into a specific category's result set.
  bool matchesValues(Iterable<String?> rawValues) {
    if (isAllSentinel) return true;

    final normalized = <String>{};
    for (final value in rawValues) {
      if (value == null) continue;
      final normalizedValue = normalizeSearchText(value);
      if (normalizedValue.isNotEmpty) normalized.add(normalizedValue);
    }
    if (normalized.isEmpty) return false;

    final canonical = canonicalDataValues
        .map(normalizeSearchText)
        .where((value) => value.isNotEmpty)
        .toSet();
    if (normalized.any(canonical.contains)) return true;

    final tokens = matchTokens
        .map(normalizeSearchText)
        .where((value) => value.isNotEmpty)
        .toList();
    return normalized.any(
      (value) => tokens.any((token) => value.contains(token)),
    );
  }

  @override
  String toString() => 'SearchCategoryDefinition(${id.name}, $uiLabel)';
}

/// The one and only registry of Search categories.
///
/// Nothing else in the app may hardcode these Hindi strings: widgets read
/// [SearchCategories.all], state carries [SearchCategoryId], and the data layer
/// resolves it back through [SearchCategories.byId].
abstract final class SearchCategories {
  /// "सभी भजन" — ALL sentinel. No category restriction.
  static const SearchCategoryDefinition allBhajan = SearchCategoryDefinition(
    id: SearchCategoryId.allBhajan,
    uiLabel: 'सभी भजन',
    canonicalDataValues: <String>[],
    matchTokens: <String>[],
    order: 0,
  );

  /// "शाही भजनवाली" — maps to the existing production value "शाही भजनावली".
  static const SearchCategoryDefinition shahiBhajanavali =
      SearchCategoryDefinition(
        id: SearchCategoryId.shahiBhajanavali,
        uiLabel: 'शाही भजनवाली',
        canonicalDataValues: <String>['शाही भजनावली', 'शाही भजनवाली'],
        matchTokens: <String>['भजनावली'],
        order: 1,
      );

  /// "पदावली भजन" — matches the existing production value "पदावली भजन".
  static const SearchCategoryDefinition padavaliBhajan =
      SearchCategoryDefinition(
        id: SearchCategoryId.padavaliBhajan,
        uiLabel: 'पदावली भजन',
        canonicalDataValues: <String>['पदावली भजन'],
        matchTokens: <String>['पदावली'],
        order: 2,
      );

  /// "स्वागत गीत" — matches the existing production value "स्वागत गीत".
  static const SearchCategoryDefinition swagatGeet = SearchCategoryDefinition(
    id: SearchCategoryId.swagatGeet,
    uiLabel: 'स्वागत गीत',
    canonicalDataValues: <String>['स्वागत गीत'],
    matchTokens: <String>['स्वागत'],
    order: 3,
  );

  /// The four permanent system categories in the exact product order.
  static const List<SearchCategoryDefinition> all = <SearchCategoryDefinition>[
    allBhajan,
    shahiBhajanavali,
    padavaliBhajan,
    swagatGeet,
  ];

  /// Category selected when Search opens.
  static const SearchCategoryDefinition defaultCategory = allBhajan;

  /// Exact UI labels in the permanent order.
  static List<String> get uiLabels => all
      .map((category) => category.uiLabel)
      .toList(growable: false);

  /// The permanent categories as stable identifiers, in order.
  static List<SearchCategoryId> get ids => all
      .map((category) => category.id)
      .toList(growable: false);

  static SearchCategoryDefinition? byId(SearchCategoryId id) {
    for (final category in all) {
      if (category.id == id) return category;
    }
    return null;
  }

  static SearchCategoryDefinition? byUiLabel(String label) {
    final normalized = normalizeSearchText(label);
    if (normalized.isEmpty) return null;
    for (final category in all) {
      if (normalizeSearchText(category.uiLabel) == normalized) return category;
    }
    return null;
  }
}