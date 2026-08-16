# LEVEL 2 — TERTIARY BUTTON SPECIFICATION & AUDIT DOCUMENTATION

## 1. Executive Summary
The canonical `SSPTertiaryButton` component has been successfully engineered, verified, and integrated into the Santmat Satsang Prachar Mobile User Android application. Built on the Level 1 design token system (`SSPColors`, `SSPTypography`, `SSPSpacing`, `SSPRadius`, `SSPAnimation`, `SSPIcons`), it establishes the lowest-emphasis tier of the application's action hierarchy while guaranteeing touch target accessibility (48dp min height), state stability, layout preservation during loading, screen reader semantics, and reduced-motion support.

## 2. Visual Hierarchy & Action Architecture
- **Three-Tier Action Hierarchy:**
  - **`SSPPrimaryButton` (Solid Filled):** High visual weight (`SSPColors.deepSaffron` background) for main actions (e.g. "Sign In", "Play").
  - **`SSPSecondaryButton` (Outlined):** Moderate visual weight (1.5dp Saffron border, transparent background) for supporting actions (e.g. "Cancel", "Filter").
  - **`SSPTertiaryButton` (Text Minimal):** Lowest visual weight (transparent background, no persistent border, brand color text) for low-emphasis actions (e.g. "Skip", "Learn More", "See All", "Details").
- **Typography:** Uses `SSPTypography.labelLarge` (Noto Sans Devanagari 14pt `FontWeight.w600`).
- **Default Width Behavior:** Defaults to `SSPButtonWidth.intrinsic` so tertiary text actions size naturally to content without taking unnecessary horizontal space.

## 3. Component API Structure
```dart
class SSPTertiaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final bool isLoading;
  final SSPButtonWidth width; // Defaults to SSPButtonWidth.intrinsic
  final String? semanticLabel;
  final double minimumHeight; // Defaults to 48.0 min touch target

  const SSPTertiaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
    this.width = SSPButtonWidth.intrinsic,
    this.semanticLabel,
    this.minimumHeight = SSPSpacing.minTouchTarget,
  });

  const SSPTertiaryButton.text({ ... }); // Backward-compatibility alias
}
```

## 4. State Matrix
| State | Visual Treatment | Touch & Semantics |
|---|---|---|
| **Default (Enabled)** | Transparent surface, no persistent border, Saffron label text | Active tap target, `isEnabled: true` |
| **Pressed** | Light motion scale feedback via `SSPPressable` | Interactive touch down |
| **Disabled** | Muted text color (`SSPColors.softWhite` / `SSPColors.templeBrown` at `0.38` opacity) | Callback prevented, `isEnabled: false` |
| **Loading** | Inline `CircularProgressIndicator` (18dp) + preserved label text | Callback prevented, `hint: 'Busy loading'` |
| **Dark Theme** | Dark primary text color on dark background | Context-aware dark theme contrast adaptation |

## 5. Accessibility & Touch Standards
- **Min Touch Target:** Enforces `48.0` logical pixel minimum touch height (`SSPSpacing.minTouchTarget`).
- **Screen Reader Semantics:** Explicit `Semantics(container: true, button: true, enabled: !isDisabled)` with screen reader `semanticLabel` override support.
- **No Text Duplication:** Internal label text wrapped in `ExcludeSemantics` to prevent double screen reader announcements.
- **Font Scaling:** Responds dynamically to system text scaling.

## 6. Verification Summary
- **Static Analysis (`flutter analyze`):** PASS (0 errors, 0 warnings)
- **Unit & Widget Test Suite (`flutter test`):** PASS (Authoritative count: 136 tests passed)
- **APK Build (`flutter build apk --debug`):** PASS (Built successfully in 13.7s)
- **Regression:** `SSPPrimaryButton` (12 tests) and `SSPSecondaryButton` (12 tests) pass 100% cleanly.
