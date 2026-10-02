import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/typography/ssp_typography.dart';
import '../providers/profile_providers.dart';
import '../services/profile_image_service.dart';
import 'profile_image_cropper_dialog.dart';

class ProfileImagePickerSheet {
  static Future<void> show({
    required BuildContext context,
    required WidgetRef ref,
    required bool hasCustomPhoto,
  }) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    await showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? SSPColors.darkSurface : SSPColors.lightSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: SSPSpacing.md),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: SSPSpacing.md),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.white24 : Colors.black12,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: SSPSpacing.lg),
                  child: Text(
                    'प्रोफ़ाइल फ़ोटो बदलें (Change Photo)',
                    style: SSPTypography.titleMedium.copyWith(
                      color: SSPColors.textPrimary(context),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: SSPSpacing.sm),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary)
                          .withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.camera_alt_outlined,
                      color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
                    ),
                  ),
                  title: const Text('कैमरा से फ़ोटो लें (Camera)'),
                  subtitle: const Text('नया फ़ोटो खींचें'),
                  onTap: () {
                    Navigator.pop(bottomSheetContext);
                    _handleImagePick(context, ref, ImageSource.camera);
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary)
                          .withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.photo_library_outlined,
                      color: isDark ? SSPColors.darkPrimary : SSPColors.lightPrimary,
                    ),
                  ),
                  title: const Text('फ़ोटो गैलरी से चुनें (Gallery)'),
                  subtitle: const Text('गैलरी से मौजूदा फ़ोटो चुनें'),
                  onTap: () {
                    Navigator.pop(bottomSheetContext);
                    _handleImagePick(context, ref, ImageSource.gallery);
                  },
                ),
                if (hasCustomPhoto)
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: SSPColors.error.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.delete_outline_rounded,
                        color: SSPColors.error,
                      ),
                    ),
                    title: Text(
                      'फ़ोटो हटाएं (Remove Custom Photo)',
                      style: TextStyle(color: SSPColors.error),
                    ),
                    subtitle: const Text('गूगल फ़ोटो या डिफ़ॉल्ट अवतार पर वापस जाएं'),
                    onTap: () {
                      Navigator.pop(bottomSheetContext);
                      _handleRemovePhoto(context, ref);
                    },
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  static Future<void> _handleImagePick(
    BuildContext context,
    WidgetRef ref,
    ImageSource source,
  ) async {
    final imageService = ProfileImageService();
    final pickResult = await imageService.pickImage(source);

    if (pickResult.status == ImagePickResultStatus.cancelled) {
      return;
    }

    if (pickResult.status == ImagePickResultStatus.permissionPermanentlyDenied) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(pickResult.errorMessage ?? 'कैमरा अनुमति आवश्यक है'),
            action: SnackBarAction(
              label: 'सेटिंग्स',
              onPressed: () => openAppSettings(),
            ),
          ),
        );
      }
      return;
    }

    if (pickResult.status == ImagePickResultStatus.permissionDenied) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(pickResult.errorMessage ?? 'अनुमति अस्वीकृत कर दी गई'),
          ),
        );
      }
      return;
    }

    if (!pickResult.isSuccess || pickResult.bytes == null) {
      if (context.mounted && pickResult.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(pickResult.errorMessage!)),
        );
      }
      return;
    }

    if (!context.mounted) return;

    // Launch interactive square 1:1 cropper
    final File? croppedFile = await ProfileImageCropperDialog.show(
      context,
      pickResult.bytes!,
    );

    if (croppedFile == null || !context.mounted) {
      return; // Crop cancelled
    }

    // Show uploading snackbar
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
            SizedBox(width: 12),
            Text('फ़ोटो अपलोड हो रही है... (Uploading photo...)'),
          ],
        ),
        duration: Duration(seconds: 15),
      ),
    );

    try {
      final uploadResult = await ref
          .read(profileStateProvider.notifier)
          .uploadProfilePhoto(croppedFile);

      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        if (uploadResult.isSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई (Photo updated successfully)'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('अपलोड त्रुटि: ${uploadResult.error?.toString() ?? "अज्ञात त्रुटि"}'),
              backgroundColor: SSPColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('अपलोड में त्रुटि: ${e.toString()}'),
            backgroundColor: SSPColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  static Future<void> _handleRemovePhoto(
    BuildContext context,
    WidgetRef ref,
  ) async {
    try {
      final result = await ref
          .read(profileStateProvider.notifier)
          .removeProfilePhoto();

      if (context.mounted) {
        if (result.isSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('फ़ोटो हटा दी गई (Photo removed)'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('त्रुटि: ${result.error?.toString()}'),
              backgroundColor: SSPColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('त्रुटि: ${e.toString()}'),
            backgroundColor: SSPColors.error,
          ),
        );
      }
    }
  }
}
