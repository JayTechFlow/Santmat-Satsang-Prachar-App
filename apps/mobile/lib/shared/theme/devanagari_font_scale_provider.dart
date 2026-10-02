import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/storage/storage_service.dart';
import '../../features/profile/presentation/providers/profile_providers.dart';

const String kDevanagariFontScaleKey = 'devanagari_font_scale';

class DevanagariFontScaleNotifier extends Notifier<double> {
  static const double minScale = 0.8;
  static const double maxScale = 1.4;
  static const double defaultScale = 1.0;

  @override
  double build() {
    // Sync with Profile preferences when loaded
    ref.listen(profileStateProvider, (prev, next) {
      if (next.hasValue && next.value != null) {
        final profileScale = next.value!.preferences.devanagariFontScale;
        final clamped = profileScale.clamp(minScale, maxScale);
        if ((state - clamped).abs() > 0.01) {
          state = clamped;
        }
      }
    });

    try {
      final prefs = ref.read(sharedPreferencesProvider);
      final saved = prefs.getDouble(kDevanagariFontScaleKey);
      if (saved != null) {
        return saved.clamp(minScale, maxScale);
      }
    } catch (_) {}

    return defaultScale;
  }

  Future<void> setScale(double scale) async {
    final clamped = scale.clamp(minScale, maxScale);
    state = clamped;

    try {
      final prefs = ref.read(sharedPreferencesProvider);
      await prefs.setDouble(kDevanagariFontScaleKey, clamped);
    } catch (_) {}

    try {
      final profileState = ref.read(profileStateProvider);
      if (profileState.hasValue && profileState.value != null) {
        final profile = profileState.value!;
        ref.read(profileStateProvider.notifier).updatePreferences(
              profile.preferences.copyWith(devanagariFontScale: clamped),
            );
      }
    } catch (_) {}
  }
}

final devanagariFontScaleProvider =
    NotifierProvider<DevanagariFontScaleNotifier, double>(
  DevanagariFontScaleNotifier.new,
);
