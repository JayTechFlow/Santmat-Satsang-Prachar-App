import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/pages/audio_home_page.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_state.dart';
import 'package:santmat_satsang_prachar/l10n/gen/app_localizations.dart';
import '../../../../helpers/mock_audio_data_source.dart';

/// Builds the production-shaped catalogue: 23 शाही, 21 पदावली, 4 स्वागत, 2
/// legacy unclassified — the exact distribution the Admin dashboard reports for the
/// 50-track dataset.
List<AudioEntity> _productionShapedCatalogue() {
  final categories = <String>[
    ...List.filled(13, 'शाही भजनवाली'),
    ...List.filled(10, 'शाही भजनावली'),
    ...List.filled(21, 'पदावली भजन'),
    ...List.filled(4, 'स्वागत गीत'),
    ...List.filled(2, ''),
  ];
  return List.generate(categories.length, (i) {
    return AudioEntity(
      id: 'track-${i + 1}',
      title: 'भजन ${i + 1}',
      subtitle: '',
      description: '',
      speaker: 'गायक',
      category: AudioCategoryEntity(id: categories[i], name: categories[i].isNotEmpty ? categories[i] : 'सभी भजन'),
      duration: const Duration(minutes: 3),
      language: 'हिंदी',
      thumbnailUrl: '',
      artworkUrl: '',
      releaseDate: DateTime(2026, 1, 1),
      playCount: 0,
      favoriteCount: 0,
      isFeatured: false,
      isRecentlyAdded: false,
      isPopular: false,
      audioUrl: 'https://example.com/track-${i + 1}.mp3',
    );
  });
}

class _FixedAudioHomeNotifier extends AudioHomeNotifier {
  _FixedAudioHomeNotifier(this.items);

  final List<AudioEntity> items;

  @override
  AudioHomeState build() =>
      AudioHomeState(isLoading: false, latestAudio: items);

  @override
  Future<void> loadHomeData() async {}
}

class _IdlePlaybackNotifier extends PlaybackNotifier {
  @override
  PlaybackStateEntity build() => const PlaybackStateEntity();
}

Finder _favoriteButtons() => find.byWidgetPredicate(
  (w) =>
      w.key is ValueKey<String> &&
      (w.key! as ValueKey<String>).value.startsWith('fav_'),
);

Future<void> _pumpAudioHome(WidgetTester tester, List<AudioEntity> items) async {
  // Tall viewport so the lazily-built list can materialize every row, letting
  // the test count rendered tracks deterministically.
  tester.view.physicalSize = const Size(900, 5600);
  tester.view.devicePixelRatio = 1.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        audioHomeStateProvider.overrideWith(
          () => _FixedAudioHomeNotifier(items),
        ),
        audioDataSourceProvider.overrideWithValue(MockAudioDataSource()),
        audioPlayerProvider.overrideWithValue(null),
        playbackStateProvider.overrideWith(() => _IdlePlaybackNotifier()),
      ],
      child: const MaterialApp(
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: AudioHomePage(),
      ),
    ),
  );
  await tester.pump(const Duration(milliseconds: 100));
}

void main() {
  testWidgets('renders every published track, not just the newest few', (
    tester,
  ) async {
    final items = _productionShapedCatalogue();
    await _pumpAudioHome(tester, items);

    expect(_favoriteButtons(), findsNWidgets(50));
    expect(find.text('भजन 1'), findsOneWidget);
    expect(find.text('भजन 50'), findsOneWidget);
  });

  testWidgets('category chips filter the complete catalogue accurately', (
    tester,
  ) async {
    await _pumpAudioHome(tester, _productionShapedCatalogue());

    await tester.tap(find.widgetWithText(ChoiceChip, 'पदावली भजन'));
    await tester.pump();
    expect(_favoriteButtons(), findsNWidgets(21));

    await tester.tap(find.widgetWithText(ChoiceChip, 'शाही भजनावली'));
    await tester.pump();
    expect(_favoriteButtons(), findsNWidgets(23));

    await tester.tap(find.widgetWithText(ChoiceChip, 'स्वागत गीत'));
    await tester.pump();
    expect(_favoriteButtons(), findsNWidgets(4));

    await tester.tap(find.widgetWithText(ChoiceChip, 'सभी भजन'));
    await tester.pump();
    expect(_favoriteButtons(), findsNWidgets(50));
  });

  testWidgets('search still narrows the complete catalogue', (tester) async {
    await _pumpAudioHome(tester, _productionShapedCatalogue());

    await tester.tap(find.byIcon(Icons.search_rounded));
    await tester.pump();
    await tester.enterText(find.byType(TextField), 'भजन 50');
    await tester.pump();

    expect(_favoriteButtons(), findsOneWidget);
    expect(find.byKey(const ValueKey('fav_track-50')), findsOneWidget);
  });

  testWidgets(
      'renders exactly the four category chips — never a general chip',
      (tester) async {
    await _pumpAudioHome(tester, _productionShapedCatalogue());

    expect(find.byType(ChoiceChip), findsNWidgets(4));
    for (final label in ['सभी भजन', 'शाही भजनावली', 'पदावली भजन', 'स्वागत गीत']) {
      expect(find.widgetWithText(ChoiceChip, label), findsOneWidget);
    }
    expect(find.text('General'), findsNothing);
    expect(find.text('general'), findsNothing);
  });

  testWidgets('legacy/unclassified tracks stay only in the ALL aggregate',
      (tester) async {
    await _pumpAudioHome(tester, _productionShapedCatalogue());

    // track-49 and track-50 carry empty category: they must
    // never surface inside a named category ...
    for (final label in ['शाही भजनावली', 'पदावली भजन', 'स्वागत गीत']) {
      await tester.tap(find.widgetWithText(ChoiceChip, label));
      await tester.pump();
      expect(find.text('भजन 49'), findsNothing, reason: label);
      expect(find.text('भजन 50'), findsNothing, reason: label);
    }

    // ... but they remain reachable through the सभी भजन aggregate.
    await tester.tap(find.widgetWithText(ChoiceChip, 'सभी भजन'));
    await tester.pump();
    expect(find.text('भजन 49'), findsOneWidget);
    expect(find.text('भजन 50'), findsOneWidget);
  });
}
