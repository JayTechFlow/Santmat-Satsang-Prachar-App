import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/pages/audio_details_page.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/pages/now_playing_page.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/l10n/gen/app_localizations.dart';

// Mock Provider for Audio Details
final mockAudio = AudioEntity(
  id: 'test_audio_1',
  title: 'Test Audio Track',
  subtitle: 'Subtitle',
  description: 'Description',
  speaker: 'Test Speaker',
  audioUrl: 'https://example.com/audio.mp3',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  artworkUrl: 'https://example.com/art.jpg',
  duration: const Duration(minutes: 5),
  releaseDate: DateTime.now(),
  category: AudioCategoryEntity(id: 'cat1', name: 'Cat1'),
  language: 'hi',
  playCount: 100,
  favoriteCount: 10,
  isFeatured: false,
  isPopular: false,
  isRecentlyAdded: true,
  lyrics: 'Sample lyrics content',
);

void main() {
  testWidgets('AudioDetailsPage renders artwork and basic info', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          audioDetailsProvider('test_audio_1').overrideWith((ref) => mockAudio),
          playbackStateProvider.overrideWith(
            () => MockPlaybackNotifier(
              PlaybackStateEntity(
                currentAudio: mockAudio,
                status: PlaybackStatus.playing,
              ),
            ),
          ),
          audioPlayerProvider.overrideWithValue(null),
        ],
        child: const MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: AudioDetailsPage(audioId: 'test_audio_1'),
        ),
      ),
    );

    // Initial loading state
    await tester.pump(const Duration(milliseconds: 500));

    // Verify Title and Header
    expect(find.byType(NowPlayingPage), findsOneWidget);
    expect(find.text('अब चल रहा है'), findsOneWidget);
  });
}

class MockPlaybackNotifier extends PlaybackNotifier {
  final PlaybackStateEntity mockState;
  MockPlaybackNotifier(this.mockState);

  @override
  PlaybackStateEntity build() {
    return mockState;
  }
}
