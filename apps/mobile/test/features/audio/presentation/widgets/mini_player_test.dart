import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/player/canonical_player_controller.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/widgets/mini_player.dart';
import 'package:santmat_satsang_prachar/shared/design_system/components/ssp_mini_player.dart';

AudioEntity audioOf(String id) => AudioEntity(
  id: id,
  title: 'Song $id',
  subtitle: '',
  description: '',
  speaker: 'Santmat',
  audioUrl: 'https://example.com/$id.mp3',
  thumbnailUrl: '',
  artworkUrl: '',
  duration: const Duration(minutes: 3),
  releaseDate: DateTime(2024),
  category: AudioCategoryEntity(id: 'c', name: 'C'),
  language: 'hi',
  playCount: 0,
  favoriteCount: 0,
  isFeatured: false,
  isPopular: false,
  isRecentlyAdded: false,
);

class FakePlaybackNotifier extends PlaybackNotifier {
  FakePlaybackNotifier(this.seed);
  PlaybackStateEntity seed;
  int clearCalls = 0;
  int playPreviousCalls = 0;
  int playNextCalls = 0;
  final List<Duration> seeks = [];

  @override
  PlaybackStateEntity build() => seed;

  @override
  Future<void> clear() async {
    clearCalls++;
    seed = const PlaybackStateEntity(status: PlaybackStatus.idle);
    state = seed;
  }

  @override
  void seekTo(Duration position) {
    seeks.add(position);
  }

  @override
  Future<void> playPrevious([List<AudioEntity>? playlist]) async =>
      playPreviousCalls++;

  @override
  Future<void> playNext([List<AudioEntity>? playlist]) async => playNextCalls++;
}

/// The mini player renders a looping waveform animation, so the tree never
/// "settles". Pump a fixed, generous number of frames instead.
Future<void> settle(WidgetTester tester) async {
  for (var i = 0; i < 12; i++) {
    await tester.pump(const Duration(milliseconds: 120));
  }
}

void main() {
  late FakePlaybackNotifier notifier;

  setUp(
    () => notifier = FakePlaybackNotifier(
      const PlaybackStateEntity(status: PlaybackStatus.idle),
    ),
  );

  /// Mirrors the real app shell: every route renders the one Mini Player at
  /// the root of the shell's stack, so the router is above it in the tree.
  Widget shell(Widget content) => Scaffold(
    body: Column(
      children: [
        Expanded(child: content),
        const MiniPlayer(),
      ],
    ),
  );

  GoRouter router() => GoRouter(
    initialLocation: '/audio',
    routes: [
      GoRoute(
        path: '/audio',
        builder: (_, __) => shell(const Text('AUDIO-LIST')),
      ),
      GoRoute(
        path: '/books/reader',
        builder: (_, __) => shell(const Text('BOOK-READER')),
      ),
      GoRoute(
        path: canonicalPlayerRoute(':audioId'),
        builder: (_, state) =>
            shell(Text('PLAYER:${state.pathParameters['audioId']}')),
      ),
    ],
  );

  Future<ProviderContainer> pumpMini(
    WidgetTester tester, {
    required GoRouter goRouter,
  }) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          playbackStateProvider.overrideWith(() => notifier),
          audioPlayerProvider.overrideWithValue(null),
        ],
        child: MaterialApp.router(routerConfig: goRouter),
      ),
    );
    await settle(tester);
    return ProviderScope.containerOf(
      tester.element(find.byType(Column).first),
      listen: false,
    );
  }

  testWidgets('hides entirely when there is no track', (tester) async {
    await pumpMini(tester, goRouter: router());
    expect(find.byType(SSPMiniPlayer), findsNothing);
  });

  testWidgets('hides when the session exists but has no active audio', (
    tester,
  ) async {
    notifier.seed = const PlaybackStateEntity(status: PlaybackStatus.idle);
    await pumpMini(tester, goRouter: router());
    expect(find.byType(SSPMiniPlayer), findsNothing);
  });

  testWidgets('shows for a live collapsed session', (tester) async {
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
    );
    await pumpMini(tester, goRouter: router());

    expect(find.byType(SSPMiniPlayer), findsOneWidget);
    expect(find.text('Song a'), findsOneWidget);
  });

  testWidgets('hides while the full player is on screen', (tester) async {
    final goRouter = router();
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
    );
    final container = await pumpMini(tester, goRouter: goRouter);
    expect(find.byType(SSPMiniPlayer), findsOneWidget);

    container
        .read(canonicalPlayerControllerProvider)
        .open(
          tester.element(find.text('AUDIO-LIST')),
          PlayerOpenRequest.track(audioOf('a'), source: 'list'),
        );
    await settle(tester);

    expect(find.text('PLAYER:a'), findsOneWidget);
    expect(
      find.byType(SSPMiniPlayer),
      findsNothing,
      reason:
          'the player owns the surface; the mini player must not duplicate it',
    );
  });

  testWidgets('hides on an excluded screen such as the book reader', (
    tester,
  ) async {
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
    );
    final goRouter = router()..go('/books/reader');
    await pumpMini(tester, goRouter: goRouter);

    expect(find.text('BOOK-READER'), findsOneWidget);
    expect(find.byType(SSPMiniPlayer), findsNothing);
  });

  testWidgets('tapping the mini player opens the full player at the current '
      'position without restarting', (tester) async {
    final goRouter = router();
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
      position: const Duration(seconds: 42),
    );
    await pumpMini(tester, goRouter: goRouter);

    await tester.tap(find.text('Song a'));
    await settle(tester);

    expect(find.text('PLAYER:a'), findsOneWidget);
    expect(
      notifier.seed.position,
      const Duration(seconds: 42),
      reason: 'opening from the mini player must not rewind the track',
    );
  });

  testWidgets('the mini player uses smart previous and next', (tester) async {
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
    );
    await pumpMini(tester, goRouter: router());

    await tester.tap(find.byIcon(Icons.skip_previous_rounded));
    await settle(tester);
    expect(notifier.playPreviousCalls, 1);

    await tester.tap(find.byIcon(Icons.skip_next_rounded));
    await settle(tester);
    expect(notifier.playNextCalls, 1);
  });

  testWidgets('the mini player skips can be held to seek', (tester) async {
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
      position: const Duration(seconds: 30),
    );
    final goRouter = router();
    await pumpMini(tester, goRouter: goRouter);

    final prev = find.byIcon(Icons.skip_previous_rounded);
    final gesture = await tester.startGesture(tester.getCenter(prev));
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pump(const Duration(milliseconds: 200));
    await gesture.up();
    await settle(tester);

    expect(
      notifier.playPreviousCalls,
      0,
      reason: 'a hold on the skip control is a seek, not a track change',
    );
    expect(
      notifier.seeks,
      isNotEmpty,
      reason: 'holding the back control must move the position backwards',
    );
    for (final target in notifier.seeks) {
      expect(
        target,
        lessThan(const Duration(seconds: 30)),
        reason: 'the back control holds backwards from 30s',
      );
    }
  });

  testWidgets('the close control clears the one session', (tester) async {
    notifier.seed = PlaybackStateEntity(
      currentAudio: audioOf('a'),
      status: PlaybackStatus.playing,
    );
    await pumpMini(tester, goRouter: router());

    await tester.tap(find.byIcon(Icons.close_rounded));
    await settle(tester);

    expect(notifier.clearCalls, 1);
    expect(find.byType(SSPMiniPlayer), findsNothing);
  });
}
