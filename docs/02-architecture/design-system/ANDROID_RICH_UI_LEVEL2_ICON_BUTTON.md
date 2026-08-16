# LEVEL 2 — ICON BUTTON SPECIFICATION & AUDIT DOCUMENTATION

## 1. Executive Summary
The canonical `SSPIconButton` component has been successfully engineered, verified, and integrated into the Santmat Satsang Prachar Mobile User Android application. Built on the Level 1 design token system (`SSPColors`, `SSPTypography`, `SSPSpacing`, `SSPRadius`, `SSPAnimation`, `SSPIcons`), it establishes the canonical icon-only interactive control while enforcing strict screen reader semantics (`semanticLabel`), 48dp minimum touch target boundaries, Material 3 variant support (standard, filled, outlined, tonal), selected state toggles, and reduced-motion feedback.

## 2. Accessibility & Semantics Architecture
- **Compulsory Semantic Label:** The constructor enforces `required String semanticLabel` to eliminate inaccessible icon-only controls.
- **Screen Reader Role:** Wraps layout in `Semantics(container: true, button: true, enabled: !isDisabled, selected: isSelected, label: semanticLabel)`.
- **Duplicate Prevention:** Internal child content is wrapped in `ExcludeSemantics` so screen readers only announce the button's explicit action intent once.
- **Touch Target:** Enforces `48.0` logical pixel minimum width and height (`SSPSpacing.minTouchTarget`).

## 3. Variant Decision & API Structure
Supports four Material 3 visual variants tailored for different UI surface roles:
- `SSPIconButtonVariant.standard`: Transparent background for app bars and clean toolbars.
- `SSPIconButtonVariant.filled`: Solid saffron background (`SSPColors.lightPrimary` / `darkPrimary`) for prominent floating or primary icon actions.
- `SSPIconButtonVariant.outlined`: Transparent background with 1.5dp border for secondary icon actions.
- `SSPIconButtonVariant.tonal`: Subtle container background (`SSPColors.lightPrimaryContainer` / `darkPrimaryContainer`) for card actions and medium-emphasis controls.

```dart
class SSPIconButton extends StatelessWidget {
  final Widget icon;
  final VoidCallback? onPressed;
  final String semanticLabel;
  final String? tooltip;
  final SSPIconButtonVariant variant;
  final bool isSelected;
  final bool isLoading;
  final double iconSize;
  final double minimumSize;

  const SSPIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    required this.semanticLabel,
    this.tooltip,
    this.variant = SSPIconButtonVariant.standard,
    this.isSelected = false,
    this.isLoading = false,
    this.iconSize = 24.0,
    this.minimumSize = SSPSpacing.minTouchTarget,
  });
}
```

## 4. State Matrix
| State | Visual Treatment | Semantics |
|---|---|---|
| **Enabled** | Theme and variant-driven color profile | `enabled: true` |
| **Pressed** | Scale feedback via `SSPPressable` | Interactive tap |
| **Disabled** | Muted opacity (`0.38`) & container background | `enabled: false` |
| **Loading** | Inline `CircularProgressIndicator` (24dp) | `hint: 'Busy loading'`, `value: 'loading'` |
| **Selected** | Primary theme tint & selected border | `isSelected: true` (`SemanticsFlag.isSelected`) |

## 5. Verification Summary
- **Static Analysis (`flutter analyze`):** PASS (0 errors, 0 warnings)
- **Unit & Widget Test Suite (`flutter test`):** PASS (Authoritative count: 152 tests passed)
- **APK Build (`flutter build apk --debug`):** PASS (Built successfully in 11.2s)
- **Regression:** `SSPPrimaryButton` (12 tests), `SSPSecondaryButton` (12 tests), and `SSPTertiaryButton` (14 tests) pass 100% cleanly.
