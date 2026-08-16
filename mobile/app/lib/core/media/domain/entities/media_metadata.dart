// Enterprise Media Platform — Media Metadata Entity
// Sprint M1 Foundation

class MediaMetadata {
  final String filename;
  final String originalFilename;
  final String mimeType;
  final int sizeBytes;
  final String extension;
  final String? checksum;
  final int? width;
  final int? height;
  final double? duration;
  final int? bitrate;
  final int? sampleRate;
  final int? pageCount;
  final String? encoding;
  final String? colorSpace;
  final String? blurHashPlaceholder;
  final String? previewUrl;
  final String? streamingPreviewUrl;
  final List<double>? waveformPoints;
  final String? posterUrl;
  final double? frameRate;
  final String? videoCodec;
  final String? author;
  final String? documentCategory;
  final bool? isEncrypted;
  final Map<String, String> customFields;

  const MediaMetadata({
    required this.filename,
    required this.originalFilename,
    required this.mimeType,
    required this.sizeBytes,
    required this.extension,
    this.checksum,
    this.width,
    this.height,
    this.duration,
    this.bitrate,
    this.sampleRate,
    this.pageCount,
    this.encoding,
    this.colorSpace,
    this.blurHashPlaceholder,
    this.previewUrl,
    this.streamingPreviewUrl,
    this.waveformPoints,
    this.posterUrl,
    this.frameRate,
    this.videoCodec,
    this.author,
    this.documentCategory,
    this.isEncrypted,
    this.customFields = const {},
  });

  String get humanReadableSize {
    if (sizeBytes < 1024) return '${sizeBytes}B';
    if (sizeBytes < 1024 * 1024) return '${(sizeBytes / 1024).toStringAsFixed(1)}KB';
    if (sizeBytes < 1024 * 1024 * 1024) return '${(sizeBytes / (1024 * 1024)).toStringAsFixed(1)}MB';
    return '${(sizeBytes / (1024 * 1024 * 1024)).toStringAsFixed(1)}GB';
  }

  String? get humanReadableDuration {
    if (duration == null) return null;
    final d = Duration(seconds: duration!.round());
    final hours = d.inHours;
    final minutes = d.inMinutes.remainder(60);
    final seconds = d.inSeconds.remainder(60);
    if (hours > 0) {
      return '${hours}h ${minutes}m ${seconds}s';
    }
    if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    }
    return '${seconds}s';
  }
}
