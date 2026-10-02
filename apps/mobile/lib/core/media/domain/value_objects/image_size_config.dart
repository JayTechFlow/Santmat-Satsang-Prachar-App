/// Controlled production defaults for image dimensions consumed by the Android
/// app. These values are server-tunable (Firebase Remote Config) but always
/// validated against safe bounds so a misconfigured server value can never
/// break layout.
///
/// Contract:
///   - Bhajan artwork: 600x600 (square)
///   - App / bhajan icon: 256x256 (square)
///   - Promotional banner: 1280x720 (16:9)
class ImageSizeConfig {
  static const int defaultArtworkSize = 600;
  static const int defaultIconSize = 256;
  static const int defaultBannerWidth = 1280;
  static const int defaultBannerHeight = 720;

  /// Absolute minimum/maximum accepted values (pixels).
  static const int minDim = 16;
  static const int maxDim = 4096;

  final int artworkSize;
  final int iconSize;
  final int bannerWidth;
  final int bannerHeight;

  const ImageSizeConfig({
    required this.artworkSize,
    required this.iconSize,
    required this.bannerWidth,
    required this.bannerHeight,
  });

  static const ImageSizeConfig defaults = ImageSizeConfig(
    artworkSize: defaultArtworkSize,
    iconSize: defaultIconSize,
    bannerWidth: defaultBannerWidth,
    bannerHeight: defaultBannerHeight,
  );

  static int _sanitize(int? v, int fallback) {
    if (v == null || v <= 0) return fallback;
    if (v < minDim) return minDim;
    if (v > maxDim) return maxDim;
    return v;
  }

  /// Validated config from either remote or local values. Unknown/zero/invalid
  /// values fall back to the controlled defaults, out-of-range values are
  /// clamped per-field.
  factory ImageSizeConfig.validated({
    int? artworkSize,
    int? iconSize,
    int? bannerWidth,
    int? bannerHeight,
    ImageSizeConfig fallback = defaults,
  }) {
    return ImageSizeConfig(
      artworkSize: _sanitize(artworkSize, fallback.artworkSize),
      iconSize: _sanitize(iconSize, fallback.iconSize),
      bannerWidth: _sanitize(bannerWidth, fallback.bannerWidth),
      bannerHeight: _sanitize(bannerHeight, fallback.bannerHeight),
    );
  }

  /// Aspect ratio implied by the artwork (square artwork -> 1.0).
  double get artworkAspectRatio => 1.0;

  /// Aspect ratio implied by the banner (1280x720 -> 16:9).
  double get bannerAspectRatio =>
      bannerHeight == 0 ? 16 / 9 : bannerWidth / bannerHeight;

  bool get isSquareArtwork => artworkAspectRatio == 1.0;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ImageSizeConfig &&
          other.artworkSize == artworkSize &&
          other.iconSize == iconSize &&
          other.bannerWidth == bannerWidth &&
          other.bannerHeight == bannerHeight;

  @override
  int get hashCode =>
      Object.hash(artworkSize, iconSize, bannerWidth, bannerHeight);

  @override
  String toString() =>
      'ImageSizeConfig(artwork:${artworkSize}x$artworkSize, '
      'icon:${iconSize}x$iconSize, banner:${bannerWidth}x$bannerHeight)';
}

/// Remote-config keys that drive the image-size settings.
class ImageSizeConfigKeys {
  static const String artworkSize = 'image_artwork_size';
  static const String iconSize = 'image_icon_size';
  static const String bannerWidth = 'image_banner_width';
  static const String bannerHeight = 'image_banner_height';
}