import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/pages/audio_details_page.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
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
);

void main() {
  testWidgets('AudioDetailsPage renders artwork and basic info', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          audioDetailsProvider('test_audio_1').overrideWith((ref) => mockAudio),
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
    await tester.pump();
    
    // Wait for FutureProvider to resolve
    await tester.pump(const Duration(seconds: 1));

    // Verify Title and Speaker
    expect(find.text('Test Audio Track'), findsOneWidget);
    expect(find.text('Test Speaker'), findsOneWidget);

    // Verify Playback Controls exist
    expect(find.byIcon(Icons.shuffle), findsOneWidget);
    expect(find.byIcon(Icons.skip_previous), findsOneWidget);
    expect(find.byIcon(Icons.play_arrow), findsOneWidget);
    expect(find.byIcon(Icons.skip_next), findsOneWidget);
    expect(find.byIcon(Icons.repeat), findsOneWidget);
    
    // Verify missing features (the TODOs mentioned in QA Report)
    // They exist in the UI but might not have functionality yet.
    // In a pure QA context, we are just validating the UI components render.
  });
}
