import '../../../../core/utils/duration_parser.dart';
import '../../../stuti_vinati/domain/entities/stuti_vinati_entity.dart';
import '../entities/audio_category_entity.dart';
import '../entities/audio_entity.dart';

/// Bridges [StutiVinati] into the single audio session's [AudioEntity] model.
///
/// Stuti playback is not a second engine: it is the same player with a
/// different content shape. Mapping it here — instead of privately inside the
/// notifier — means the Stuti list can hand the exact same entity to the
/// canonical player-opening method as any Bhajan list, so Stuti and Bhajan
/// sessions are interchangeable in the one Full Player and the one Mini Player.
AudioEntity stutiToAudioEntity(StutiVinati stuti) {
  final category = const AudioCategoryEntity(id: 'stuti', name: ' स्तुति ');

  return AudioEntity(
    id: stuti.id,
    title: stuti.title,
    subtitle: stuti.subtitle ?? '',
    description: stuti.textContent ?? '',
    speaker: stuti.artist ?? 'संतमत',
    category: category,
    duration: parseDurationString(stuti.duration ?? '0:00'),
    language: 'hi',
    thumbnailUrl: stuti.bannerImage ?? '',
    artworkUrl: stuti.bannerImage ?? '',
    releaseDate: DateTime.now(),
    playCount: 0,
    favoriteCount: stuti.isFavorite ? 1 : 0,
    isFeatured: false,
    isRecentlyAdded: false,
    isPopular: false,
    audioUrl: stuti.audioUrl ?? '',
    lyrics: stuti.textContent,
  );
}
