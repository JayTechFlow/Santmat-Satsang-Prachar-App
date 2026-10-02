import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';
import '../services/profile_image_service.dart';

class ProfileImageCropperDialog extends StatefulWidget {
  final Uint8List imageBytes;

  const ProfileImageCropperDialog({
    super.key,
    required this.imageBytes,
  });

  static Future<File?> show(BuildContext context, Uint8List bytes) {
    return showDialog<File?>(
      context: context,
      barrierDismissible: false,
      builder: (context) => ProfileImageCropperDialog(imageBytes: bytes),
    );
  }

  @override
  State<ProfileImageCropperDialog> createState() =>
      _ProfileImageCropperDialogState();
}

class _ProfileImageCropperDialogState extends State<ProfileImageCropperDialog> {
  final TransformationController _transformController =
      TransformationController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _transformController.dispose();
    super.dispose();
  }

  void _resetTransform() {
    setState(() {
      _transformController.value = Matrix4.identity();
    });
  }

  Future<void> _handleConfirm() async {
    setState(() {
      _isProcessing = true;
    });

    try {
      // Crop and optimize to controlled 256x256 square avatar
      final optimizedFile = await ProfileImageService.optimizeAvatar(
        rawBytes: widget.imageBytes,
        targetSize: 256,
        quality: 85,
      );

      if (mounted) {
        Navigator.of(context).pop(optimizedFile);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('क्रॉप करने में त्रुटि: ${e.toString()}'),
            backgroundColor: SSPColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final cropSize = (screenSize.width * 0.75).clamp(200.0, 300.0);

    return Dialog(
      backgroundColor: const Color(0xFF1C1917),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      shape: RoundedRectangleBorder(
        borderRadius: SSPRadius.brLarge,
        side: const BorderSide(color: Color(0xFF44403C)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(SSPSpacing.md),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'फ़ोटो व्यवस्थित करें (Crop Photo)',
                  style: SSPTypography.titleMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh_rounded, color: Colors.white70),
                  tooltip: 'रीसेट करें (Reset)',
                  onPressed: _isProcessing ? null : _resetTransform,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '1:1 चौकोर अनुपात में सेट करें (Square 256×256)',
              style: SSPTypography.bodySmall.copyWith(
                color: Colors.white60,
              ),
            ),
            const SizedBox(height: SSPSpacing.md),

            // Interactive Crop Viewport
            ClipRRect(
              borderRadius: SSPRadius.brMedium,
              child: SizedBox(
                width: cropSize,
                height: cropSize,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Interactive image with zoom & pan
                    InteractiveViewer(
                      transformationController: _transformController,
                      minScale: 1.0,
                      maxScale: 3.5,
                      boundaryMargin: const EdgeInsets.all(40),
                      child: Image.memory(
                        widget.imageBytes,
                        fit: BoxFit.contain,
                      ),
                    ),

                    // Square crop frame overlay
                    IgnorePointer(
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: const Color(0xFFF59E0B),
                            width: 2.0,
                          ),
                          borderRadius: BorderRadius.circular(cropSize / 2),
                        ),
                      ),
                    ),

                    // Guide grid
                    IgnorePointer(
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.2),
                            width: 1.0,
                          ),
                        ),
                      ),
                    ),

                    if (_isProcessing)
                      Container(
                        color: Colors.black54,
                        child: const Center(
                          child: CircularProgressIndicator.adaptive(
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: SSPSpacing.lg),

            // Actions (Cancel / Confirm)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _isProcessing
                        ? null
                        : () => Navigator.of(context).pop(null),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white70,
                      side: const BorderSide(color: Color(0xFF57534E)),
                      shape: RoundedRectangleBorder(
                        borderRadius: SSPRadius.brPill,
                      ),
                    ),
                    child: const Text('रद्द करें (Cancel)'),
                  ),
                ),
                const SizedBox(width: SSPSpacing.md),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isProcessing ? null : _handleConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFD97706),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: SSPRadius.brPill,
                      ),
                    ),
                    child: _isProcessing
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('पुष्टि करें (Confirm)'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
