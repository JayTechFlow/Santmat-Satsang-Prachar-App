import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/image_size_config.dart';

void main() {
  group('ImageSizeConfig defaults (controlled production contract)', () {
    test('uses 600x600 artwork, 256x256 icon, 1280x720 banner', () {
      expect(ImageSizeConfig.defaults.artworkSize, 600);
      expect(ImageSizeConfig.defaults.iconSize, 256);
      expect(ImageSizeConfig.defaults.bannerWidth, 1280);
      expect(ImageSizeConfig.defaults.bannerHeight, 720);
      expect(ImageSizeConfig.defaults.artworkAspectRatio, 1.0);
      expect(ImageSizeConfig.defaults.bannerAspectRatio, closeTo(16 / 9, 0.001));
      expect(ImageSizeConfig.defaults.isSquareArtwork, isTrue);
    });
  });

  group('ImageSizeConfig.validated', () {
    test('keeps in-range values untouched', () {
      final c = ImageSizeConfig.validated(
        artworkSize: 600,
        iconSize: 256,
        bannerWidth: 1280,
        bannerHeight: 720,
      );
      expect(c.artworkSize, 600);
      expect(c.iconSize, 256);
      expect(c.bannerWidth, 1280);
      expect(c.bannerHeight, 720);
    });

    test('zero and negative values fall back to defaults', () {
      final c = ImageSizeConfig.validated(
        artworkSize: 0,
        iconSize: -5,
        bannerWidth: 0,
        bannerHeight: 0,
      );
      expect(c.artworkSize, ImageSizeConfig.defaultArtworkSize);
      expect(c.iconSize, ImageSizeConfig.defaultIconSize);
      expect(c.bannerWidth, ImageSizeConfig.defaultBannerWidth);
      expect(c.bannerHeight, ImageSizeConfig.defaultBannerHeight);
    });

    test('absurd server values are clamped to hard bounds', () {
      final c = ImageSizeConfig.validated(
        artworkSize: 999999,
        iconSize: ImageSizeConfig.maxDim,
        bannerWidth: ImageSizeConfig.minDim,
        bannerHeight: 1,
      );
      expect(c.artworkSize, ImageSizeConfig.maxDim);
      expect(c.iconSize, ImageSizeConfig.maxDim);
      expect(c.bannerWidth, ImageSizeConfig.minDim);
      expect(c.bannerHeight, ImageSizeConfig.minDim);
    });
  });
}