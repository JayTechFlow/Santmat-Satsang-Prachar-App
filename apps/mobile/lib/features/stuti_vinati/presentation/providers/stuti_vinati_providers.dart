import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/di/data_providers.dart';
import '../../../audio/presentation/providers/audio_providers.dart';
import '../../domain/entities/stuti_vinati_entity.dart';

final stutiVinatiListProvider = StreamProvider<List<StutiVinati>>((ref) {
  final repository = ref.watch(stutiVinatiRepositoryProvider);
  return repository.watchAll();
});

class StutiFavoritesNotifier extends Notifier<Set<String>> {
  @override
  Set<String> build() {
    return {'stuti-morning'};
  }

  void toggleFavorite(String id) {
    if (state.contains(id)) {
      state = {...state}..remove(id);
    } else {
      state = {...state, id};
    }
    ref.read(toggleFavoriteAudioUseCaseProvider).call(id);
  }
}

final stutiFavoritesProvider =
    NotifierProvider<StutiFavoritesNotifier, Set<String>>(
      StutiFavoritesNotifier.new,
    );

class StutiVinatiPlaybackState {
  final String? playingId;
  final bool isPlaying;
  final Duration position;
  final Duration duration;
  final StutiVinati? currentStuti;

  const StutiVinatiPlaybackState({
    this.playingId,
    this.isPlaying = false,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.currentStuti,
  });

  StutiVinatiPlaybackState copyWith({
    String? playingId,
    bool? isPlaying,
    Duration? position,
    Duration? duration,
    StutiVinati? currentStuti,
  }) {
    return StutiVinatiPlaybackState(
      playingId: playingId ?? this.playingId,
      isPlaying: isPlaying ?? this.isPlaying,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      currentStuti: currentStuti ?? this.currentStuti,
    );
  }
}

class StutiVinatiPlaybackNotifier extends Notifier<StutiVinatiPlaybackState> {
  @override
  StutiVinatiPlaybackState build() {
    return const StutiVinatiPlaybackState();
  }

  Future<void> playPause(StutiVinati stuti) async {
    final notifier = ref.read(playbackStateProvider.notifier);
    await notifier.playStuti(stuti);
  }

  Future<void> seek(Duration newPosition) async {
    final notifier = ref.read(playbackStateProvider.notifier);
    notifier.seekTo(newPosition);
  }
}

final stutiPlaybackProvider =
    NotifierProvider<StutiVinatiPlaybackNotifier, StutiVinatiPlaybackState>(
      StutiVinatiPlaybackNotifier.new,
    );
