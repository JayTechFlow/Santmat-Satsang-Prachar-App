import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class SSPImage extends StatelessWidget {
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
  Widget build(BuildContext context) {
    if (imageUrl.isEmpty) {
      return _buildErrorWidget(context, imageUrl, null);
    }
    
    return CachedNetworkImage(
      imageUrl: imageUrl,
      fit: fit,
      width: width,
      height: height,
      alignment: alignment as Alignment,
      placeholder: placeholder ?? (context, url) => Container(
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
