import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:santmat_satsang_prachar/core/player/canonical_player_controller.dart';
import 'package:santmat_satsang_prachar/core/player/mini_player_visibility.dart';
import 'package:santmat_satsang_prachar/core/player/player_lifecycle.dart';
import 'package:santmat_satsang_prachar/core/player/player_surface.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_category_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/audio_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';

/// Records every call the canonical controller makes into the one session, so
/// the test can assert on *what the controller did*, not just on the route.
class RecordingPlaybackNotifier extends PlaybackNotifier {
  RecordingPlaybackNotifier(this.seed);

  PlaybackStateEntity seed;
  final List<String> calls = [];
  final List<AudioEntity> played = [];
  List<AudioEntity> lastQueue = const [];
  int lastIndex = -1;

  @override
  PlaybackStateEntity build() => seed;

  @override
  void selectTrack(
    AudioEntity? audio, {
    String? audioId,
    List<AudioEntity> queue = const [],
    int index = 0,
  }) {
    calls.add('selectTrack');
    lastQueue = queue;
    lastIndex = index;
    state = state.copyWith(currentAudio: audio, status: PlaybackStatus.loading);
  }

  @override
  Future<void> play(AudioEntity audio, {bool forceRefreshUrl = false}) async {
    calls.add('play');
    played.add(audio);
  }
}

AudioEntity audioOf(String id, {String? title}) => AudioEntity(
  id: id,
  title: title ?? 'Title $id',
  subtitle: '',
  description: '',
  speaker: 'Speaker',
  audioUrl: 'https://example.com/$id.mp3',
  thumbnailUrl: '',
  artworkUrl: '',
  duration: const Duration(minutes: 4),
  releaseDate: DateTime(2024),
  category: AudioCategoryEntity(id: 'cat', name: 'Cat'),
  language: 'hi',
  playCount: 0,
  favoriteCount: 0,
  isFeatured: false,
  isPopular: false,
  isRecentlyAdded: false,
);

void main() {
  late RecordingPlaybackNotifier notifier;

  setUp(
    () => notifier = RecordingPlaybackNotifier(
      const PlaybackStateEntity(status: PlaybackStatus.idle),
    ),
  );

  GoRouter buildRouter() => GoRouter(
    initialLocation: '/audio',
    routes: [
      GoRoute(
        path: '/audio',
        builder: (_, __) => const Scaffold(body: Text('AUDIO-LIST')),
      ),
      GoRoute(
        path: canonicalPlayerRoute(':audioId'),
        builder: (_, state) =>
            Scaffold(body: Text('PLAYER:${state.pathParameters['audioId']}')),
      ),
    ],
  );

  Future<ProviderContainer> pumpPlayer(
    WidgetTester tester, {
    required GoRouter router,
  }) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          playbackStateProvider.overrideWith(() => notifier),
          audioPlayerProvider.overrideWithValue(null),
        ],
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pumpAndSettle();
    return ProviderScope.containerOf(
      tester.element(find.byType(Scaffold).first),
      listen: false,
    );
  }

  group('canonicalPlayerRoute', () {
    test('builds the single canonical full-player route', () {
      expect(canonicalPlayerRoute('abc'), '/audio/details/abc');
    });

    test('parses the audio id back out of a player route', () {
      expect(audioIdFromPlayerRoute('/audio/details/abc'), 'abc');
      expect(audioIdFromPlayerRoute('/audio/details/abc?x=1'), 'abc');
      expect(audioIdFromPlayerRoute('/audio'), isNull);
      expect(audioIdFromPlayerRoute('/search'), isNull);
    });
  });

  group('PlayerOpenRequest.track', () {
    test('carries the id, entity and autoplay default', () {
      final audio = audioOf('t1');
      final request = PlayerOpenRequest.track(audio);
      expect(request.audioId, 't1');
      expect(request.audio, audio);
      expect(request.autoplay, isTrue);
      expect(request.queue, isEmpty);
      expect(request.index, 0);
    });

    test('copyWith can turn autoplay off for library actions', () {
      final request = PlayerOpenRequest.track(
        audioOf('t1'),
      ).copyWith(autoplay: false);
      expect(request.autoplay, isFalse);
      expect(request.audioId, 't1');
    });
  });

  group('open()', () {
    testWidgets('a song-list tap opens the full player, not the mini player', (
      tester,
    ) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(
              audioOf('song-a'),
              queue: [audioOf('song-a'), audioOf('song-b')],
              index: 0,
              source: 'list',
            ),
          );
      await tester.pumpAndSettle();

      expect(find.text('PLAYER:song-a'), findsOneWidget);
      expect(router.state.uri.path, '/audio/details/song-a');
    });

    testWidgets('marks the full-player surface open before navigating', (
      tester,
    ) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(audioOf('song-a'), source: 'list'),
          );
      await tester.pumpAndSettle();

      // The surface is already open, so the Mini Player is hidden and can
      // never flash on the list screen for a frame.
      expect(
        container.read(playerSurfaceProvider),
        PlayerSurface.fullPlayerOpen,
      );
      expect(
        resolveMiniPlayerVisibilityFor(notifier.lifecycle).reason,
        MiniPlayerHiddenReason.fullPlayerVisible,
      );
    });

    testWidgets('pushes rather than replaces, so Back returns to the list', (
      tester,
    ) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(audioOf('song-a'), source: 'list'),
          );
      await tester.pumpAndSettle();
      expect(
        router.canPop(),
        isTrue,
        reason: 'the list must stay on the stack',
      );

      router.pop();
      await tester.pumpAndSettle();
      expect(find.text('AUDIO-LIST'), findsOneWidget);
    });

    testWidgets('attaches the caller queue so Previous/Next work', (
      tester,
    ) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(
              audioOf('song-a'),
              queue: [audioOf('song-a'), audioOf('song-b')],
              index: 0,
              source: 'list',
            ),
          );
      await tester.pumpAndSettle();

      expect(notifier.calls, contains('selectTrack'));
      final state = container.read(playbackStateProvider);
      expect(state.currentAudio?.id, 'song-a');
      expect(notifier.lastQueue.map((a) => a.id), ['song-a', 'song-b']);
      expect(notifier.lastIndex, 0);
    });

    testWidgets('starts playback without blocking navigation', (tester) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(audioOf('song-a'), source: 'list'),
          );
      await tester.pumpAndSettle();

      expect(notifier.played.map((a) => a.id), contains('song-a'));
    });

    testWidgets('re-opening the ACTIVE track never restarts it', (
      tester,
    ) async {
      final router = buildRouter();
      // The user is already 42s into song-a.
      notifier.seed = PlaybackStateEntity(
        currentAudio: audioOf('song-a'),
        status: PlaybackStatus.playing,
        position: const Duration(seconds: 42),
      );
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      final opened = container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(audioOf('song-a'), source: 'mini'),
          );
      await tester.pumpAndSettle();

      expect(opened, isTrue);
      expect(
        notifier.calls,
        isNot(contains('selectTrack')),
        reason: 're-selecting would reset the position',
      );
      expect(
        notifier.played,
        isEmpty,
        reason: 'tapping the song that is already playing must not restart it',
      );
      // The position survives.
      expect(
        container.read(playbackStateProvider).position,
        const Duration(seconds: 42),
      );
    });

    testWidgets('a second press while the player is open swaps the track in '
        'place instead of stacking a player', (tester) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));
      final controller = container.read(canonicalPlayerControllerProvider);

      controller.open(
        context,
        PlayerOpenRequest.track(audioOf('song-a'), source: 'list'),
      );
      await tester.pumpAndSettle();

      final depthAfterFirst = router.state.uri.path;
      final swapped = controller.open(
        tester.element(find.text('PLAYER:song-a')),
        PlayerOpenRequest.track(audioOf('song-b'), source: 'now-playing'),
      );
      await tester.pumpAndSettle();

      expect(swapped, isTrue);
      expect(
        router.state.uri.path,
        depthAfterFirst,
        reason: 'swapping must not push a second player route',
      );
      expect(
        router.canPop(),
        isTrue,
        reason: 'Back must still return to the list the user came from',
      );
      expect(container.read(playbackStateProvider).currentAudio?.id, 'song-b');
      expect(
        container.read(playerSurfaceProvider),
        PlayerSurface.fullPlayerOpen,
      );
    });

    testWidgets('pressing the already-active track from inside the player is a '
        'no-op', (tester) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final controller = container.read(canonicalPlayerControllerProvider);
      final context = tester.element(find.text('AUDIO-LIST'));

      controller.open(
        context,
        PlayerOpenRequest.track(audioOf('song-a'), source: 'list'),
      );
      await tester.pumpAndSettle();

      final again = controller.open(
        tester.element(find.text('PLAYER:song-a')),
        PlayerOpenRequest.track(audioOf('song-a'), source: 'now-playing'),
      );
      await tester.pumpAndSettle();

      expect(again, isFalse);
      expect(notifier.played.where((a) => a.id == 'song-a').length, 1);
    });

    testWidgets('an autoplay:false library action opens the player without '
        'starting playback', (tester) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      container
          .read(canonicalPlayerControllerProvider)
          .open(
            context,
            PlayerOpenRequest.track(
              audioOf('song-a'),
              source: 'playlist',
            ).copyWith(autoplay: false),
          );
      await tester.pumpAndSettle();

      expect(find.text('PLAYER:song-a'), findsOneWidget);
      expect(notifier.played, isEmpty);
      expect(container.read(playbackStateProvider).currentAudio?.id, 'song-a');
    });

    testWidgets(
      'an id-only request still opens the player and loads the track',
      (tester) async {
        final router = buildRouter();
        final container = await pumpPlayer(tester, router: router);
        final context = tester.element(find.text('AUDIO-LIST'));

        final opened = container
            .read(canonicalPlayerControllerProvider)
            .open(
              context,
              PlayerOpenRequest(audioId: 'deep-linked', source: 'search'),
            );
        await tester.pumpAndSettle();

        expect(opened, isTrue);
        expect(router.state.uri.path, '/audio/details/deep-linked');
        expect(
          notifier.played,
          isEmpty,
          reason: 'with no entity the player screen resolves and starts it',
        );
      },
    );

    testWidgets('a blank id is rejected and navigates nowhere', (tester) async {
      final router = buildRouter();
      final container = await pumpPlayer(tester, router: router);
      final context = tester.element(find.text('AUDIO-LIST'));

      final opened = container
          .read(canonicalPlayerControllerProvider)
          .open(context, PlayerOpenRequest(audioId: '   ', source: 'bad'));
      await tester.pumpAndSettle();

      expect(opened, isFalse);
      expect(router.state.uri.path, '/audio');
      expect(notifier.calls, isEmpty);
      expect(notifier.played, isEmpty);
    });
  });
}
