# LEGACY DUPLICATE MIGRATION MAP

## 1. Legacy SSP Components in `shared/widgets/` → Canonical in `shared/design_system/components/`

| Legacy File | Canonical Replacement | Consumers | Migration Status |
|-------------|----------------------|-----------|------------------|
| `shared/widgets/ssp_card.dart` | `shared/design_system/components/ssp_card.dart` | stuti_vinati_home_page.dart (NO - it uses ssp_prayer_card, not ssp_card), **none** (audio_home_page uses SSPHeroBanner, SSPAudioTile, SSPSectionHeader) | Verify |
| `shared/widgets/ssp_empty_state.dart` | `shared/design_system/components/ssp_empty_state.dart` | stuti_vinati_home_page.dart, audio_home_page.dart | ❌ Need Migration |
| `shared/widgets/ssp_error_state.dart` | `shared/design_system/components/ssp_error_state.dart` | stuti_vinati_home_page.dart, audio_home_page.dart, audio_details_page.dart | ❌ Need Migration |
| `shared/widgets/ssp_audio_tile.dart` | `shared/design_system/components/ssp_audio_tile.dart` | audio_home_page.dart, audio_details_page.dart | ❌ Need Migration |
| `shared/widgets/ssp_app_bar.dart` | `shared/design_system/components/ssp_app_bar.dart` | stuti_vinati_home_page.dart, audio_home_page.dart | ❌ Need Migration |
| `shared/widgets/ssp_section_header.dart` | `shared/design_system/components/ssp_section_header.dart` | audio_home_page.dart | ❌ Need Migration |
| `shared/widgets/ssp_loading.dart` | `shared/design_system/components/ssp_loading_state.dart` | stuti_vinati_home_page.dart, audio_home_page.dart, audio_details_page.dart | ❌ Need Migration |
| `shared/widgets/confirmation_dialog.dart` | `shared/design_system/components/ssp_confirmation_dialog.dart` | **NONE** (dead code) | ✅ Can Delete |
| `shared/widgets/empty_state.dart` | `shared/design_system/components/ssp_empty_state.dart` | **NONE** (dead code) | ✅ Can Delete |
| `shared/widgets/error_state.dart` | `shared/design_system/components/ssp_error_state.dart` | async_value_extension.dart | ❌ Need Migration |
| `shared/widgets/loading_indicator.dart` | `shared/design_system/components/ssp_loading_state.dart` | async_value_extension.dart, splash_page.dart | ❌ Need Migration |

## 2. Feature State Widgets → Canonical SSP Components

| Feature | Legacy Widget | Canonical Replacement | Files to Update |
|---------|--------------|----------------------|-----------------|
| Home | `LoadingStateWidget` | `SSPLoadingState` | home_page.dart |
| Home | `ErrorStateWidget` | `SSPErrorState` | home_page.dart |
| Home | `EmptyStateWidget` | `SSPEmptyState` | home_page.dart (if used), empty_state_widget.dart (DELETE) |
| Profile | `LoadingStateWidget` | `SSPLoadingState` | profile_page.dart, edit_profile_page.dart, account_settings_page.dart |
| Profile | `ErrorStateWidget` | `SSPErrorState` | profile_page.dart |
| Profile | `EmptyStateWidget` | `SSPEmptyState` | profile_page.dart (if used), empty_state_widget.dart (DELETE) |
| Satsang | `SatsangErrorStateWidget` | `SSPErrorState` | satsang_details_page.dart, error_state_widget.dart (DELETE) |
| Satsang | `SatsangEmptyStateWidget` | `SSPEmptyState` | satsang_details_page.dart (if used), empty_state_widget.dart (DELETE) |

## 3. Button Adapters (KEEP - Already Delegating)

| Adapter | Delegates To | Consumers | Action |
|---------|-------------|-----------|--------|
| `shared/widgets/primary_button.dart` | `SSPPrimaryButton.text()` | login_page.dart, onboarding_page.dart | KEEP |
| `shared/widgets/secondary_button.dart` | `SSPSecondaryButton.text()` | login_page.dart | KEEP |

## 4. Infrastructure Components (PRESERVE - Not Duplicates)

| Component | Reason |
|-----------|--------|
| `shared/widgets/ssp_image.dart` | Firebase image loading infrastructure |
| `shared/widgets/app_scaffold.dart` | App wrapper |
| `shared/widgets/ssp_hero_banner.dart` | Marketing hero (feature-specific) |
| `shared/widgets/ssp_prayer_card.dart` | Stuti Vinati domain |
| `shared/widgets/ssp_quote_card.dart` | Quote display |
| `shared/widgets/ssp_quick_action_card.dart` | Action card with icon |
| `shared/widgets/ssp_glass_card.dart` | Glassmorphism effect |
| `shared/widgets/ssp_video_player.dart` | Video playback |
| `shared/widgets/audio_wave_animation.dart` | Audio visualization |
| `shared/widgets/ssp_mini_player.dart` | Wait - this IS a duplicate! |
| `shared/widgets/ssp_action_card.dart` | Feature-specific |
| `shared/widgets/ssp_search_bar.dart` | Legacy search bar (wrapper) |

Wait - `ssp_mini_player.dart` in shared/widgets is ALSO a duplicate of the canonical `SSPMiniPlayer`!

Let me check usage of `ssp_mini_player.dart` in shared/widgets...

## 5. Additional Legacy Duplicates Found

| Legacy File | Canonical Replacement | Consumers | Status |
|-------------|----------------------|-----------|--------|
| `shared/widgets/ssp_mini_player.dart` | `shared/design_system/components/ssp_mini_player.dart` | audio/presentation/widgets/mini_player.dart | ❌ Need Migration |
| `shared/widgets/ssp_search_bar.dart` | `shared/design_system/components/ssp_search_field.dart` | **NONE** (dead code - satsang uses SearchBarWidget which uses SSPSearchField) | ✅ Can Delete |

## 6. Summary of Files to Migrate (Feature Imports)

### Feature Pages (8 files):
1. `lib/features/audio/presentation/pages/audio_home_page.dart`
2. `lib/features/audio/presentation/pages/audio_details_page.dart`
3. `lib/features/audio/presentation/widgets/mini_player.dart`
4. `lib/features/stuti_vinati/presentation/pages/stuti_vinati_home_page.dart`
5. `lib/features/satsang/presentation/pages/satsang_details_page.dart`
6. `lib/features/authentication/presentation/pages/splash_page.dart`
7. `lib/core/utils/extensions/async_value_extension.dart`
8. `lib/features/home/presentation/pages/home_page.dart` (for state widgets)

### Feature State Widgets to Delete (6 files):
1. `lib/features/home/presentation/widgets/loading_state_widget.dart`
2. `lib/features/home/presentation/widgets/error_state_widget.dart`
3. `lib/features/home/presentation/widgets/empty_state_widget.dart`
4. `lib/features/profile/presentation/widgets/loading_state_widget.dart`
5. `lib/features/profile/presentation/widgets/error_state_widget.dart`
6. `lib/features/profile/presentation/widgets/empty_state_widget.dart`
7. `lib/features/satsang/presentation/widgets/error_state_widget.dart`
8. `lib/features/satsang/presentation/widgets/empty_state_widget.dart`

Total: 8 feature state widget files to delete/replace

## 7. Legacy Files to Delete After Migration (13 files)

1. `shared/widgets/confirmation_dialog.dart` - dead code
2. `shared/widgets/empty_state.dart` - dead code
3. `shared/widgets/error_state.dart` - used by async_value_extension (migrate first)
4. `shared/widgets/loading_indicator.dart` - used by async_value_extension, splash_page (migrate first)
5. `shared/widgets/ssp_card.dart` - verify no consumers
6. `shared/widgets/ssp_empty_state.dart` - used by stuti_vinati, audio_home_page
7. `shared/widgets/ssp_error_state.dart` - used by stuti_vinati, audio_home_page, audio_details_page
8. `shared/widgets/ssp_audio_tile.dart` - used by audio_home_page, audio_details_page
9. `shared/widgets/ssp_app_bar.dart` - used by stuti_vinati, audio_home_page
10. `shared/widgets/ssp_section_header.dart` - used by audio_home_page
11. `shared/widgets/ssp_loading.dart` - used by stuti_vinati, audio_home_page, audio_details_page
12. `shared/widgets/ssp_mini_player.dart` - used by audio/widgets/mini_player.dart
13. `shared/widgets/ssp_search_bar.dart` - dead code