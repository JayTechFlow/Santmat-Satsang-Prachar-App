# LEVEL 1 — DESIGN SYSTEM FOUNDATION SPECIFICATION & AUDIT REPORT

## 1. Overview
This document defines the canonical **SSP Mobile Design System Tokens (Level 1)** for the Santmat Satsang Prachar Mobile User Application (`mobile/app`). Built on Material 3 interaction and accessibility specifications, Level 1 provides a premium, calm, spiritual, and senior-accessible visual foundation.

## 2. Directory Structure
```text
lib/
  app/
    theme.dart                                    # Master SSPTheme & AppTheme bridge
  shared/
    design_system/
      tokens/
        colors/ssp_colors.dart                   # Color System
        typography/ssp_typography.dart           # Typography System
        spacing/ssp_spacing.dart                 # Spacing & Touch Grid
        radius/ssp_radius.dart                   # Border Radius & Shapes
        elevation/ssp_elevation.dart             # Elevation & Shadows
        animation/ssp_animation.dart             # Motion & Pressables
        icons/ssp_icons.dart                     # Iconography Mapping
```

## 3. Token Systems

### 3.1 Color System (`SSPColors`)
- **Brand Palette:** Deep Saffron (`#E65100`), Sacred Gold (`#FFB300`), Sand (`#E6D5B8`), Warm Ivory (`#FFF8E1`), Cream (`#FFFDD0`), Temple Brown (`#4A2E12`).
- **Surfaces:** Soft White (`#FAFAFA`) in Light mode, Surface Charcoal (`#1E1E1E`) & Deep Charcoal (`#121212`) in Dark mode.
- **Accessibility Contrast:** All body & title text tokens satisfy WCAG AAA standards (> 7:1) against primary surface tokens.

### 3.2 Typography System (`SSPTypography`)
- **Font Family:** Noto Sans Devanagari via `google_fonts` (optimized for Hindi & English bilingual legibility).
- **Scale:**
  - `displayLarge` (48), `displayMedium` (40), `displaySmall` (36)
  - `headlineLarge` (32), `headlineMedium` (28), `headlineSmall` (24)
  - `titleLarge` (22), `titleMedium` (18), `titleSmall` (16)
  - `bodyLarge` (18), `bodyMedium` (16), `bodySmall` (14)
  - `labelLarge` (16), `labelMedium` (14), `labelSmall` (12)
- **Senior Accessibility:** Default body text is 16pt (Medium) and 18pt (Large) with 1.5 - 1.55 line height for maximum legibility. System font scaling is fully supported.

### 3.3 Spacing System (`SSPSpacing`)
- **Base Rhythm:** 8dp baseline grid with 4dp micro-step (`none`=0, `xxs`=2, `xs`=4, `sm`=8, `md`=16, `lg`=24, `xl`=32, `xxl`=48, `xxxl`=64).
- **Touch Target:** Enforces `minTouchTarget = 48.0` for senior user interactive widgets.

### 3.4 Border Radius System (`SSPRadius`)
- **Scale:** `small` (8dp), `medium` (12dp), `large` (16dp), `extraLarge` (24dp), `pill` (999dp).
- **Shapes:** Provides pre-built `RoundedRectangleBorder` instances for Material 3 theme integration.

### 3.5 Elevation System (`SSPElevation`)
- **Model:** Restrained soft ambient shadows (`subtle`, `low`, `medium`, `high`) avoiding heavy glassmorphism or floating overload.

### 3.6 Motion System (`SSPAnimation`)
- **Durations:** `instant` (50ms), `fast` (150ms), `medium` (250ms), `slow` (350ms), `pageTransition` (300ms).
- **Accessibility:** `SSPPressable` automatically checks `SSPAnimation.prefersReducedMotion(context)` and disables scale transitions for users who request reduced motion.

### 3.7 Iconography System (`SSPIcons`)
- Standardized mapping using rounded Material Icons (`Icons.*_rounded`) for friendly, high-visibility UI controls.

## 4. Legacy Migration & Single Source of Truth
`AppColors`, `AppTypography`, `AppSpacing`, and `AppTheme` under `lib/shared/theme/` and `lib/app/` act as delegating bridges to `SSPColors`, `SSPTypography`, `SSPSpacing`, and `SSPTheme`. This guarantees zero build regressions across existing screens while establishing a single source of truth in `lib/shared/design_system/tokens/`.
