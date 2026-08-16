import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/presentation/providers/media_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';

class SSPVideoPlayer extends ConsumerStatefulWidget {
  final String? videoUrl;
  final MediaAsset? mediaAsset;
  final bool autoPlay;
  final bool showControls;

  const SSPVideoPlayer({
    super.key,
    this.videoUrl,
    this.mediaAsset,
    this.autoPlay = false,
    this.showControls = true,
  });

  @override
  ConsumerState<SSPVideoPlayer> createState() => _SSPVideoPlayerState();
}

class _SSPVideoPlayerState extends ConsumerState<SSPVideoPlayer> {
  VideoPlayerController? _controller;
  bool _isLoading = true;
  String? _errorMessage;
  bool _hasLoggedComplete = false;
  bool _isDisposed = false;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  @override
  void didUpdateWidget(SSPVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl ||
        oldWidget.mediaAsset != widget.mediaAsset) {
      _initializePlayer();
    }
  }

  Future<void> _initializePlayer({bool forceRefreshUrl = false}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final offlineService = ref.read(offlineMediaServiceProvider);
      final resolver = ref.read(mediaUrlResolverProvider);
      final assetId = widget.mediaAsset?.id;

      File? offlineFile;
      if (assetId != null) {
        offlineFile = offlineService.getDownloadedFile(assetId);
      }

      VideoPlayerController controller;

      if (offlineFile != null && offlineFile.existsSync()) {
        controller = VideoPlayerController.file(offlineFile);
      } else {
        final rawPath = widget.videoUrl ??
            widget.mediaAsset?.storageUrl ??
            widget.mediaAsset?.storagePath ??
            '';

        if (rawPath.isEmpty) {
          throw Exception('No valid video URL or path provided');
        }

        final resolvedUrl = await resolver.resolveDownloadUrl(
          rawPath,
          forceRefresh: forceRefreshUrl,
        );

        controller = VideoPlayerController.networkUrl(Uri.parse(resolvedUrl));
      }

      await controller.initialize();

      if (_isDisposed) {
        await controller.dispose();
        return;
      }

      _controller?.dispose();
      _controller = controller;

      controller.addListener(_videoListener);

      if (widget.autoPlay) {
        await controller.play();
        _logPlayEvent();
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      if (!forceRefreshUrl && widget.videoUrl != null) {
        // Attempt one retry with forced signed URL refresh
        return _initializePlayer(forceRefreshUrl: true);
      }

      if (_isDisposed) return;

      final errorMsg = 'Failed to load video: $e';
      setState(() {
        _isLoading = false;
        _errorMessage = errorMsg;
      });

      if (widget.mediaAsset != null) {
        ref.read(playbackAnalyticsServiceProvider).logMediaError(
              id: widget.mediaAsset!.id,
              error: errorMsg,
            );
      }
    }
  }

  void _videoListener() {
    if (_controller == null || !_controller!.value.isInitialized) return;

    final value = _controller!.value;
    if (value.position >= value.duration &&
        value.duration > Duration.zero &&
        !_hasLoggedComplete) {
      _hasLoggedComplete = true;
      if (widget.mediaAsset != null) {
        ref.read(playbackAnalyticsServiceProvider).logMediaComplete(
              id: widget.mediaAsset!.id,
              duration: value.duration,
            );
      }
    }
  }

  void _logPlayEvent() {
    final asset = widget.mediaAsset;
    if (asset != null) {
      ref.read(playbackAnalyticsServiceProvider).logMediaPlay(
            id: asset.id,
            title: asset.title ?? 'Video Asset',
            mediaType: 'video',
            category: asset.category.value,
          );
    }
  }

  void _togglePlayPause() {
    if (_controller == null || !_controller!.value.isInitialized) return;

    if (_controller!.value.isPlaying) {
      _controller!.pause();
      if (widget.mediaAsset != null) {
        ref.read(playbackAnalyticsServiceProvider).logMediaPause(
              id: widget.mediaAsset!.id,
              position: _controller!.value.position,
            );
      }
    } else {
      _hasLoggedComplete = false;
      _controller!.play();
      _logPlayEvent();
    }
    setState(() {});
  }

  @override
  void dispose() {
    _isDisposed = true;
    _controller?.removeListener(_videoListener);
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        height: 220,
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator.adaptive(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          ),
        ),
      );
    }

    if (_errorMessage != null ||
        _controller == null ||
        !_controller!.value.isInitialized) {
      return Container(
        height: 220,
        color: Colors.black,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.white, size: 42),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  _errorMessage ?? 'Unable to play video',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: () => _initializePlayer(forceRefreshUrl: true),
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final value = _controller!.value;

    return AspectRatio(
      aspectRatio: value.aspectRatio > 0 ? value.aspectRatio : 16 / 9,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          VideoPlayer(_controller!),
          if (widget.showControls) ...[
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: _togglePlayPause,
              child: AnimatedOpacity(
                opacity: value.isPlaying ? 0.0 : 1.0,
                duration: const Duration(milliseconds: 300),
                child: Container(
                  color: Colors.black38,
                  child: Center(
                    child: Icon(
                      value.isPlaying
                          ? Icons.pause_circle_filled
                          : Icons.play_circle_filled,
                      color: Colors.white,
                      size: 64,
                    ),
                  ),
                ),
              ),
            ),
            VideoProgressIndicator(
              _controller!,
              allowScrubbing: true,
              colors: const VideoProgressColors(
                playedColor: Colors.deepOrange,
                bufferedColor: Colors.white38,
                backgroundColor: Colors.white24,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
