# LEVEL 2 — SEARCH FIELD SPECIFICATION & AUDIT DOCUMENTATION

## 1. Executive Summary
The canonical `SSPSearchField` input primitive component has been successfully engineered, verified, and integrated into the Santmat Satsang Prachar Mobile User Android application. Built on the Level 1 design token system (`SSPColors`, `SSPTypography`, `SSPSpacing`, `SSPRadius`, `SSPAnimation`, `SSPIcons`), `SSPSearchField` is a pure presentation component that handles text input, focus states, keyboard IME actions (`TextInputAction.search`), clear action affordances via `SSPIconButton`, loading progress visuals, Hindi/Devanagari Unicode input, and screen reader semantics without containing any business logic or network side-effects.

## 2. Existing Search Architecture & Audit
- **Audit Findings:** The existing search architecture separates data sources (`SearchDataSource`), repositories (`SearchRepositoryImpl`), Riverpod state notifiers (`searchProvider`), and presentation pages (`SearchHomePage`).
- **Input Component Separation:** Previously, `SearchHomePage` used raw `TextField` in its app bar while `SearchBarWidget` used a basic filled `TextField`. `SSPSearchField` was created to standardize search input presentation across the entire application without touching search business logic, debounce logic, or domain repositories.

## 3. Component API Structure
```dart
class SSPSearchField extends StatefulWidget {
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? hintText;
  final String? semanticLabel;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onClear;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final TextInputAction textInputAction; // Defaults to TextInputAction.search
  final TextInputType keyboardType;
  final bool enabled;
  final bool readOnly;
  final bool isLoading;
  final bool showClearButton;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final bool autofocus;

  const SSPSearchField({ ... });
}
```

## 4. Controller & FocusNode Lifecycle Management
- **External Ownership:** If the caller provides an external `TextEditingController` or `FocusNode`, `SSPSearchField` attaches listeners to synchronize internal state (`_hasText`, `_isFocused`) but **NEVER** disposes them on unmount.
- **Internal Fallback:** If no controller or focus node is provided, `SSPSearchField` lazily creates and manages its own internal instances, disposing them properly in `dispose()`.
- **Rebuild Safety:** Rebuilds do not re-instantiate controllers or duplicate listeners.

## 5. State Matrix & Visual Design
- **Container Styling:** Uses `SSPRadius.brPill` with `SSPColors.lightSurfaceVariant` / `darkSurfaceVariant`.
- **Focus Highlight:** Smoothly animates a 1.5dp border (`SSPColors.lightPrimary` / `darkPrimary`) using `SSPAnimation.fast` duration and `SSPAnimation.standard` curve.
- **Clear Action:** Uses canonical `SSPIconButton` for clear query handling when text is non-empty.
- **Loading State:** Replaces search icon with an 18dp `CircularProgressIndicator` while preserving query text.

## 6. Internationalization & Unicode Input
- Full support for English, Hindi, Devanagari Unicode (`संतमत सत्संग`), mixed-language strings, symbols, whitespace, and long queries without text clipping or layout overflow.

## 7. Verification Summary
- **Static Analysis (`flutter analyze`):** PASS (0 errors, 0 warnings)
- **Unit & Widget Test Suite (`flutter test`):** PASS (Authoritative count: 170 tests passed)
- **APK Build (`flutter build apk --debug`):** PASS (Built successfully in 11.2s)
- **Regression:** `SSPPrimaryButton` (12 tests), `SSPSecondaryButton` (12 tests), `SSPTertiaryButton` (14 tests), and `SSPIconButton` (15 tests) pass 100% cleanly.
