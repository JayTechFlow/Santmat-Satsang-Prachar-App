import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';

/// Published bhajan fixtures used by every Search test.
///
/// These mirror the *existing production* partition: two पदावली भजन, two
/// शाही भजनावली, one स्वागत गीत, plus one आरती row that deliberately belongs
/// to none of the three specific categories (so it is only reachable through
/// the "सभी भजन" sentinel). No production record is read or written by tests.
AudioEntity buildSearchFixture({
  required String id,
  required String title,
  required String categoryName,
  required String speaker,
  String categoryId = '',
  String subtitle = '',
  String description = '',
  String? lyrics,
}) {
  return AudioEntity(
    id: id,
    title: title,
    subtitle: subtitle,
    description: description,
    speaker: speaker,
    category: AudioCategoryEntity(
      id: categoryId.isEmpty ? categoryName : categoryId,
      name: categoryName,
    ),
    duration: const Duration(minutes: 6),
    language: 'hindi',
    thumbnailUrl: '',
    artworkUrl: '',
    releaseDate: DateTime(2024, 1, 1),
    playCount: 0,
    favoriteCount: 0,
    isFeatured: false,
    isRecentlyAdded: false,
    isPopular: false,
    audioUrl: 'https://test.com/$id.mp3',
    lyrics: lyrics,
  );
}

/// The default published dataset every Search test runs against.
final List<AudioEntity> searchPublishedBhajans = <AudioEntity>[
  buildSearchFixture(
    id: 'padavali-1',
    title: 'प्रभु से प्रीत लगाई रे',
    categoryId: 'padavali_bhajan',
    categoryName: 'पदावली भजन',
    speaker: 'संत महर्षि मेहता',
  ),
  buildSearchFixture(
    id: 'padavali-2',
    title: 'पदावली में गुरु चरण',
    categoryId: 'padavali_bhajan',
    categoryName: 'पदावली भजन',
    speaker: 'संत कबीर',
  ),
  buildSearchFixture(
    id: 'shahi-1',
    title: 'गुरु चरणन की सेवा',
    categoryId: 'shahi_bhajanavali',
    categoryName: 'शाही भजनावली',
    speaker: 'संत महर्षि मेहता',
  ),
  buildSearchFixture(
    id: 'shahi-2',
    title: 'श्री गुरु सेवा कुंज',
    categoryId: 'shahi_bhajanavali',
    categoryName: 'शाही भजनावली',
    speaker: 'संत रैदास',
  ),
  buildSearchFixture(
    id: 'swagat-1',
    title: 'स्वागत गीत',
    categoryId: 'swagat_geet',
    categoryName: 'स्वागत गीत',
    speaker: 'संत समाज',
  ),
  buildSearchFixture(
    id: 'aarti-1',
    title: 'आरती',
    categoryId: 'aarti',
    categoryName: 'आरती',
    speaker: 'संत समाज',
  ),
];