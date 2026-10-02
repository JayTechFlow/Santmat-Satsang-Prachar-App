import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../../../features/audio/data/models/audio_dto.dart';
import '../../../../features/audio/domain/entities/audio_entity.dart';
import '../../domain/entities/search_category_definition.dart';
import '../../domain/entities/search_filter_entity.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../domain/entities/search_suggestion_entity.dart';
import '../../domain/utils/search_text_utils.dart';
import '../models/search_result_dto.dart';
import 'search_data_source.dart';

class FirestoreSearchDataSource implements SearchDataSource {
  final FirestoreService _firestoreService;

  FirestoreSearchDataSource(this._firestoreService);

  /// Published audio is fetched once per [publishedAudioCacheTtl] and shared by
  /// every subsequent query, so switching categories or typing more characters
  /// never re-reads the same Firestore collection.
  static const Duration publishedAudioCacheTtl = Duration(seconds: 60);

  List<AudioEntity>? _publishedAudioCache;
  DateTime? _publishedAudioCachedAt;
  Future<List<AudioEntity>>? _publishedAudioInFlight;

  static const String _publishedStatus = 'प्रकाशित';

  /// Max results rendered by the Search screen.
  static const int maxResults = 20;

  @override
  Future<List<SearchResultEntity>> searchEverything(
    String query, {
    SearchFilterEntity? filter,
  }) async {
    final contentTypes = filter?.contentTypes;
    if (contentTypes != null &&
        contentTypes.isNotEmpty &&
        !contentTypes.contains(SearchContentType.audio)) {
      return const [];
    }

    final publishedAudio = await _publishedAudio();
    return searchPublishedAudio(
      publishedAudio,
      query: query,
      category: filter?.categoryDefinition,
    );
  }

  /// Reads the published audio collection, honouring the short-lived cache.
  Future<List<AudioEntity>> _publishedAudio() {
    final cached = _publishedAudioCache;
    final cachedAt = _publishedAudioCachedAt;
    if (cached != null &&
        cachedAt != null &&
        DateTime.now().difference(cachedAt) < publishedAudioCacheTtl) {
      return Future<List<AudioEntity>>.value(cached);
    }

    // Collapse concurrent reads for the same collection into one round trip.
    final inFlight = _publishedAudioInFlight;
    if (inFlight != null) return inFlight;

    final future = _fetchPublishedAudio();
    _publishedAudioInFlight = future;
    return future;
  }

  Future<List<AudioEntity>> _fetchPublishedAudio() async {
    try {
      final snapshot = await _firestoreService.queryCollection(
        FirestoreCollections.audio,
        (ref) => ref.where('status', isEqualTo: _publishedStatus),
      );
      final audio = snapshot.docs
          .map((doc) => AudioDto.fromFirestore(doc).toEntity())
          .toList(growable: false);
      _publishedAudioCache = audio;
      _publishedAudioCachedAt = DateTime.now();
      return audio;
    } finally {
      _publishedAudioInFlight = null;
    }
  }

  /// The complete, Firebase-free search pipeline.
  ///
  /// Takes already-fetched published audio, applies the category filter, the
  /// text query and the existing ranking, then de-duplicates by audio id.
  /// [category] `null` means the ALL sentinel (no category restriction).
  List<SearchResultEntity> searchPublishedAudio(
    Iterable<AudioEntity> publishedAudio, {
    required String query,
    SearchCategoryDefinition? category,
  }) {
    final q = normalizeSearchText(query);
    final seenIds = <String>{};
    final results = <SearchResultEntity>[];

    for (final audio in publishedAudio) {
      if (!seenIds.add(audio.id)) continue;
      if (!matchesSearchQuery(audio, q)) continue;
      if (category != null && !category.matches(audio.category)) continue;
      results.add(searchResultFromAudio(audio, q));
    }

    results.sort(
      (a, b) => rankSearchResult(a, q).compareTo(rankSearchResult(b, q)),
    );
    return results;
  }

  /// Whether [audio] matches the normalized [query] across its searchable
  /// fields (title, subtitle, speaker, category, description, lyrics).
  bool matchesSearchQuery(AudioEntity audio, String query) {
    if (query.isEmpty) return true;
    final searchable = [
      audio.title,
      audio.subtitle,
      audio.speaker,
      audio.category.name,
      audio.category.id,
      if (audio.description.isNotEmpty) audio.description,
      if (audio.lyrics != null && audio.lyrics!.isNotEmpty) audio.lyrics!,
    ];
    return searchable.any((field) => normalizedContainsAll(field, query));
  }

  /// Bump ordering: title hits rank first, then subtitle, then everything else.
  int rankSearchResult(SearchResultEntity item, String query) {
    if (query.isEmpty) return 0;
    if (normalizedContains(item.title, query)) return 0;
    if (normalizedContains(item.subtitle, query)) return 1;
    return 2;
  }

  /// Maps an [AudioEntity] to a [SearchResultEntity] deep link ready for the
  /// shell router. Never fabricates content: falls back to the category name
  /// or defaults when fields are missing.
  SearchResultEntity searchResultFromAudio(AudioEntity audio, String query) {
    final categoryName = audio.category.name.isNotEmpty
        ? audio.category.name
        : 'भजन';
    final subtitle = audio.speaker.isNotEmpty
        ? '$categoryName • ${audio.speaker}'
        : categoryName;
    List<String> tags = [categoryName];
    if (audio.speaker.isNotEmpty) tags = [...tags, audio.speaker];
    if (query.isNotEmpty && !tags.contains(query)) tags = [...tags, query];
    if (audio.description.isNotEmpty) tags = [...tags, audio.description];
    return SearchResultEntity(
      id: audio.id,
      title: audio.title,
      subtitle: subtitle,
      imageUrl: audio.thumbnailUrl.isEmpty
          ? audio.artworkUrl
          : audio.thumbnailUrl,
      type: SearchContentType.audio,
      routePath: '/audio/details/${audio.id}',
      date: audio.releaseDate,
      tags: tags,
      // Carried so the search list can build a real playback queue.
      audio: audio,
    );
  }

  @override
  Future<List<SearchSuggestionEntity>> getSearchSuggestions(
    String query,
  ) async {
    final results = await searchEverything(query);
    final q = query.toLowerCase();
    return results
        .where((item) => item.title.toLowerCase().contains(q))
        .map<SearchSuggestionEntity>(
          (item) => SearchSuggestionDto(suggestion: item.title),
        )
        .take(5)
        .toList();
  }
}