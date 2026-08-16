# LEVEL 2 — SECONDARY BUTTON SPECIFICATION & AUDIT DOCUMENTATION

## 1. Executive Summary
The canonical `SSPSecondaryButton` component has been successfully engineered, verified, and integrated into the Santmat Satsang Prachar Mobile User Android application. Built on the Level 1 design token system (`SSPColors`, `SSPTypography`, `SSPSpacing`, `SSPRadius`, `SSPAnimation`, `SSPIcons`) and sharing exact architectural conventions with `SSPPrimaryButton`, it provides a clear visual hierarchy for secondary actions while guaranteeing touch accessibility, state stability, screen reader semantics, and reduced-motion support.

## 2. Visual Hierarchy & Design Rationale
- **Subordination to Primary Button:** While `SSPPrimaryButton` uses a solid filled saffron surface (`SSPColors.deepSaffron`), `SSPSecondaryButton` utilizes a refined outlined treatment (`Border.all(color: currentBorder, width: 1.5)` with transparent background) to maintain lower visual emphasis without sacrificing legibility or touch target prominence.
- **Brand Consistency:** Text and border colors dynamically match `SSPColors.lightPrimary` / `SSPColors.darkPrimary` with `SSPRadius.brPill` corner geometry.
- **Typography:** Uses `SSPTypography.labelLarge` (Noto Sans Devanagari 14pt `FontWeight.w600`).

## 3. Component API Structure
```dart
class SSPSecondaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final bool isLoading;
  final SSPButtonWidth width; // SSPButtonWidth.full | SSPButtonWidth.intrinsic
  final String? semanticLabel;
  final double minimumHeight; // default 48.0 min touch target

  const SSPSecondaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
    this.width = SSPButtonWidth.full,
    this.semanticLabel,
    this.minimumHeight = SSPSpacing.minTouchTarget,
  });

  const SSPSecondaryButton.text({ ... }); // Backward-compatibility alias
}
```

## 4. State Matrix
| State | Visual Treatment | Touch & Semantics |
|---|---|---|
| **Default (Enabled)** | Transparent surface, 1.5dp Saffron border, Saffron label text | Active tap target, `isEnabled: true` |
| **Pressed** | Motion scale feedback via `SSPPressable` | Interactive touch down |
| **Disabled** | Muted outline border (`SSPColors.lightOutline` / `darkOutline`) with `0.38` opacity text | Callback prevented, `isEnabled: false` |
| **Loading** | Inline `CircularProgressIndicator` (18dp) + preserved label text | Callback prevented, `hint: 'Busy loading'` |
| **Dark Theme** | Dark primary border and text on dark background | Context-aware dark theme contrast adaptation |

## 5. Accessibility & Touch Standards
- **Min Touch Target:** Enforces `48.0` logical pixel minimum touch height (`SSPSpacing.minTouchTarget`).
- **Screen Reader Semantics:** Explicit `Semantics(container: true, button: true, enabled: !isDisabled)` with screen reader `semanticLabel` override support.
- **No Text Duplication:** Internal label text wrapped in `ExcludeSemantics` to prevent double screen reader announcements.
- **Font Scaling:** Responds dynamically to system text scaling.

## 6. Migration & Backward Compatibility
- Refactored legacy [`secondary_button.dart`](file:///Users/jaymac/Documents/Santmat-Satsang-Prachar/mobile/app/lib/shared/widgets/secondary_button.dart) into a delegating adapter (`SSPSecondaryButton.text`) so existing secondary action callers (`login_page.dart`) automatically gain Level 2 token styling, motion, and accessibility without breaking API contracts.

## 7. Verification Summary
- **Static Analysis (`flutter analyze`):** PASS (0 errors, 0 warnings)
- **Unit & Widget Test Suite (`flutter test`):** PASS (122 tests passed across codebase, 12 dedicated `SSPSecondaryButton` widget tests)
- **APK Build (`flutter build apk --debug`):** PASS (Built successfully in 13.3s)
