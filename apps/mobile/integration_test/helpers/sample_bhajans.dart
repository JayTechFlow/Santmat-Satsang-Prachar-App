import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';

final _testCategory = AudioCategoryEntity(
  id: 'test-category',
  name: 'Test',
);

final sampleCategoryPadavali = _testCategory;

final sampleBhajans = [
  AudioEntity(
    id: 'sample-1',
    title: 'Sample Bhajan 1',
    subtitle: 'Test Audio',
    description: 'Integration test audio',
    speaker: 'Test Speaker',
    category: _testCategory,
    duration: const Duration(minutes: 3),
    language: 'en',
    thumbnailUrl: '',
    artworkUrl: '',
    releaseDate: DateTime(2024),
    playCount: 0,
    favoriteCount: 0,
    isFeatured: false,
    isRecentlyAdded: false,
    isPopular: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  ),
  AudioEntity(
    id: 'sample-2',
    title: 'Sample Bhajan 2',
    subtitle: 'Test Audio',
    description: 'Integration test audio',
    speaker: 'Test Speaker',
    category: _testCategory,
    duration: const Duration(minutes: 4),
    language: 'en',
    thumbnailUrl: '',
    artworkUrl: '',
    releaseDate: DateTime(2024),
    playCount: 0,
    favoriteCount: 0,
    isFeatured: false,
    isRecentlyAdded: false,
    isPopular: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  ),
  AudioEntity(
    id: 'sample-3',
    title: 'Sample Bhajan 3',
    subtitle: 'Test Audio',
    description: 'Integration test audio',
    speaker: 'Test Speaker',
    category: _testCategory,
    duration: const Duration(minutes: 5),
    language: 'en',
    thumbnailUrl: '',
    artworkUrl: '',
    releaseDate: DateTime(2024),
    playCount: 0,
    favoriteCount: 0,
    isFeatured: false,
    isRecentlyAdded: false,
    isPopular: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  ),
];
