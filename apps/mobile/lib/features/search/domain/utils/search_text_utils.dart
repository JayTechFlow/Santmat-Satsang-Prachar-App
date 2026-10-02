import '../../../../features/audio/domain/entities/audio_entity.dart';
import '../entities/search_category_definition.dart';

/// Lowercases, trims and collapses repeated whitespace so both Devanagari and
/// Latin queries match consistently (Unicode-safe; no transliteration needed).
String normalizeSearchText(String input) {
  return input.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
}

/// Whether [text] contains [queryWord], both pre-normalized.
bool normalizedContains(String text, String queryWord) {
  if (queryWord.isEmpty) return true;
  final normalizedText = normalizeSearchText(text);
  return normalizedText.contains(queryWord);
}

/// Whether every normalized token of [query] appears in [text].
bool normalizedContainsAll(String text, String query) {
  final tokens = normalizeSearchText(query).split(' ');
  if (tokens.isEmpty) return true;
  return tokens.every((token) => normalizedContains(text, token));
}

/// Canonical audio search matcher shared between Search and Audio browsing.
///
/// Matches [audio] against [query] across searchable fields (title, subtitle,
/// speaker, category name/id, description, lyrics) and against [category].
/// Both [query] and [category] are optional: an empty query or null category
/// applies no restriction.
bool matchesAudioSearch(
  AudioEntity audio,
  String query,
  SearchCategoryDefinition? category,
) {
  if (category != null && !category.matches(audio.category)) {
    return false;
  }
  final trimmed = query.trim();
  if (trimmed.isEmpty) return true;

  final q = normalizeSearchText(trimmed);
  final searchable = [
    audio.title,
    audio.subtitle,
    audio.speaker,
    audio.category.name,
    audio.category.id,
    if (audio.description.isNotEmpty) audio.description,
    if (audio.lyrics != null && audio.lyrics!.isNotEmpty) audio.lyrics!,
  ];
  return searchable.any((field) => normalizedContainsAll(field, q));
}