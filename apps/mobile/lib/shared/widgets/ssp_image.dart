import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:santmat_satsang_prachar/core/media/presentation/providers/media_providers.dart';

class SSPImage extends ConsumerWidget {
  final String imageUrl;
  final BoxFit? fit;
  final double? width;
  final double? height;
  final Widget Function(BuildContext, String)? placeholder;
  final Widget Function(BuildContext, String, dynamic)? errorWidget;
  final AlignmentGeometry alignment;

  const SSPImage(
    this.imageUrl, {
    super.key,
    this.fit,
    this.width,
    this.height,
    this.placeholder,
    this.errorWidget,
    this.alignment = Alignment.center,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (imageUrl.isEmpty) {
      return _buildErrorWidget(context, imageUrl, null);
    }

    final isDirectUrl = imageUrl.startsWith('http://') ||
        imageUrl.startsWith('https://') ||
        imageUrl.startsWith('file://');

    if (isDirectUrl) {
      return _buildCachedImage(context, imageUrl);
    }

    final asyncResolved = ref.watch(resolvedMediaUrlProvider(imageUrl));

    return asyncResolved.when(
      data: (resolvedUrl) => _buildCachedImage(context, resolvedUrl),
      loading: () => placeholder != null
          ? placeholder!(context, imageUrl)
          : Container(
              width: width,
              height: height,
              color: Colors.grey.shade200,
              child: const Center(
                child: CircularProgressIndicator.adaptive(),
              ),
            ),
      error: (err, stack) => _buildErrorWidget(context, imageUrl, err),
    );
  }

  Widget _buildCachedImage(BuildContext context, String targetUrl) {
    final devicePixelRatio = MediaQuery.maybeOf(context)?.devicePixelRatio ?? 2.0;
    final memWidth = width != null && width! > 0 && width! < 2000
        ? (width! * devicePixelRatio).toInt()
        : null;
    final memHeight = height != null && height! > 0 && height! < 2000
        ? (height! * devicePixelRatio).toInt()
        : null;

    return CachedNetworkImage(
      imageUrl: targetUrl,
      fit: fit,
      width: width,
      height: height,
      memCacheWidth: memWidth,
      memCacheHeight: memHeight,
      alignment: alignment is Alignment ? alignment as Alignment : Alignment.center,
      placeholder: placeholder ??
          (context, url) => Container(
                width: width,
                height: height,
                color: Colors.grey.shade200,
                child: const Center(
                  child: CircularProgressIndicator.adaptive(),
                ),
              ),
      errorWidget: errorWidget ?? _buildErrorWidget,
    );
  }

  Widget _buildErrorWidget(BuildContext context, String url, dynamic error) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey.shade200,
      child: const Center(
        child: Icon(Icons.image_not_supported_outlined, color: Colors.grey),
      ),
    );
  }
}
