import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:just_audio_background/just_audio_background.dart';
import '../../domain/entities/stuti_vinati_entity.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';

final stutiVinatiListProvider = FutureProvider<List<StutiVinati>>((ref) async {
  final repository = ref.watch(stutiVinatiRepositoryProvider);
  return repository.getAll();
});

class StutiVinatiPlaybackState {
  final String? playingId;
  final bool isPlaying;

  const StutiVinatiPlaybackState({this.playingId, this.isPlaying = false});
}

class StutiVinatiPlaybackNotifier extends Notifier<StutiVinatiPlaybackState> {
  AudioPlayer? _player;

  @override
  StutiVinatiPlaybackState build() {
    _player = ref.watch(audioPlayerProvider);

    if (_player != null) {
      final sub = _player!.playerStateStream.listen((playerState) {
        if (playerState.processingState == ProcessingState.completed) {
          state = StutiVinatiPlaybackState(playingId: state.playingId, isPlaying: false);
        } else {
          state = StutiVinatiPlaybackState(
            playingId: state.playingId,
            isPlaying: playerState.playing,
          );
        }
      });
      ref.onDispose(() {
        sub.cancel();
      });
    }

    return const StutiVinatiPlaybackState();
  }

  Future<void> playPause(StutiVinati stuti) async {
    if (_player == null) return;
    
    if (state.playingId == stuti.id) {
      if (state.isPlaying) {
        _player!.pause();
      } else {
        _player!.play();
      }
    } else {
      state = StutiVinatiPlaybackState(playingId: stuti.id, isPlaying: true);
      try {
        await _player!.setAudioSource(
          AudioSource.uri(
            Uri.parse(stuti.audioUrl ?? ''),
            tag: MediaItem(
              id: stuti.id,
              album: "Stuti Vinati",
              title: stuti.title,
              artist: "Santmat",
            ),
          ),
        );
        _player!.play();
      } catch (e) {
        state = StutiVinatiPlaybackState(playingId: stuti.id, isPlaying: false);
      }
    }
  }
}

final stutiPlaybackProvider = NotifierProvider<StutiVinatiPlaybackNotifier, StutiVinatiPlaybackState>(
  StutiVinatiPlaybackNotifier.new,
);
