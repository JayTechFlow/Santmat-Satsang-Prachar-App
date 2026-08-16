class AccessibilityPreferenceEntity {
  final double textScaleFactor;
  final bool highContrast;
  final bool reducedMotion;
  final bool screenReaderOptimized;

  const AccessibilityPreferenceEntity({
    required this.textScaleFactor,
    required this.highContrast,
    required this.reducedMotion,
    required this.screenReaderOptimized,
  });

  AccessibilityPreferenceEntity copyWith({
    double? textScaleFactor,
    bool? highContrast,
    bool? reducedMotion,
    bool? screenReaderOptimized,
  }) {
    return AccessibilityPreferenceEntity(
      textScaleFactor: textScaleFactor ?? this.textScaleFactor,
      highContrast: highContrast ?? this.highContrast,
      reducedMotion: reducedMotion ?? this.reducedMotion,
      screenReaderOptimized:
          screenReaderOptimized ?? this.screenReaderOptimized,
    );
  }
}
