import '../../../audio/domain/entities/audio_entity.dart';

enum SearchContentType {
  satsang,
  audio,
  books,
  dailyQuotes,
  events,
  videos,
  downloads,
  gallery,
  unknown,
}

class SearchResultEntity {
  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final SearchContentType type;
  final String routePath;
  final DateTime date;
  final List<String> tags;

  /// The resolved entity when the result is audio.
  ///
  /// Search results are DTO-backed and normally only carry a deep link, but
  /// audio results already have the full [AudioEntity] in hand at mapping
  /// time. Keeping it lets the search list hand a *real* queue to the player
  /// so Previous/Next work from a search session instead of degrading to a
  /// single track. Never persisted; always null for non-audio results.
  final AudioEntity? audio;

  const SearchResultEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.type,
    required this.routePath,
    required this.date,
    required this.tags,
    this.audio,
  });
}
