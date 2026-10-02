import '../../../../core/navigation/back_navigation_controller.dart';
import '../../../../core/player/canonical_player_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/search_providers.dart';
import '../providers/search_state.dart';
import '../../domain/entities/search_category_definition.dart';
import '../../domain/entities/search_result_entity.dart';
import '../../../../shared/design_system/components/ssp_search_field.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import '../../../../shared/design_system/components/ssp_card.dart';
import '../../../../shared/design_system/components/ssp_list_item.dart';
import '../../../../shared/design_system/components/ssp_audio_tile.dart';
import '../../../../shared/design_system/components/ssp_icon_button.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';

/// The one canonical Search screen.
///
/// Every Search entry point (Home, Audio/Bhajan, Books, Quotes, Events,
/// Stuti-Vinati, Notifications) routes here, so there is a single category
/// list, a single filtering implementation and a single result renderer.
///
/// Voice Search, Search History and Popular Searches were removed: the screen
/// opens directly on real published bhajan results for the default category.
class SearchHomePage extends ConsumerStatefulWidget {
  const SearchHomePage({super.key});

  @override
  ConsumerState<SearchHomePage> createState() => _SearchHomePageState();
}

class _SearchHomePageState extends ConsumerState<SearchHomePage> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _onCategorySelected(SearchCategoryDefinition category) {
    ref.read(searchProvider.notifier).selectCategory(category.id);
  }

  void _onQuerySubmitted(String query) {
    ref
        .read(searchProvider.notifier)
        .runSearch(query, category: ref.read(searchProvider).selectedCategory);
  }

  void _onQueryChanged(String query) {
    ref.read(searchProvider.notifier).updateQuery(query);
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchProvider.notifier).updateQuery('');
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchProvider);
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: isDark
            ? SSPColors.darkSurface
            : SSPColors.headerMaroon,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: SSPIconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFFFDE68A)),
          semanticLabel: 'पीछे जाएं',
          // Same canonical policy as the Android system Back button:
          // Search is a top-level secondary page, so Back resolves to Home.
          onPressed: () => ref
              .read(backNavigationControllerProvider)
              .handleBack(context, source: BackSource.appBar),
        ),
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: SSPSpacing.md),
          child: SSPSearchField(
            controller: _searchController,
            focusNode: _searchFocusNode,
            hintText: 'भजन, गायक, स्तुति खोजें...',
            onChanged: _onQueryChanged,
            onSubmitted: _onQuerySubmitted,
            onClear: _clearSearch,
            showClearButton: true,
            autofocus: true,
          ),
        ),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          _buildCategoryBar(state, isDark),
          const Divider(height: 1, thickness: 0.5),
          Expanded(child: _buildMainContent(state)),
        ],
      ),
    );
  }

  /// The four permanent system categories, always in the product order.
  Widget _buildCategoryBar(SearchState state, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: SSPSpacing.md,
        vertical: SSPSpacing.sm,
      ),
      child: SizedBox(
        height: 36,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (var i = 0; i < SearchCategories.all.length; i++) ...[
                if (i > 0) const SizedBox(width: SSPSpacing.sm),
                FilterChip(
                  key: ValueKey(SearchCategories.all[i].id),
                  selected:
                      SearchCategories.all[i].id == state.selectedCategory,
                  label: Text(
                    SearchCategories.all[i].uiLabel,
                    style: TextStyle(
                      fontWeight:
                          SearchCategories.all[i].id == state.selectedCategory
                              ? FontWeight.bold
                              : FontWeight.normal,
                      color:
                          SearchCategories.all[i].id == state.selectedCategory
                              ? (isDark ? SSPColors.softWhite : Colors.white)
                              : SSPColors.textPrimary(context),
                    ),
                  ),
                  selectedColor: isDark
                      ? SSPColors.darkPrimary
                      : SSPColors.lightPrimary,
                  backgroundColor: isDark
                      ? SSPColors.darkSurfaceVariant
                      : SSPColors.lightSurfaceVariant,
                  checkmarkColor: isDark ? SSPColors.softWhite : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: SSPRadius.brPill,
                  ),
                  onSelected: (_) =>
                      _onCategorySelected(SearchCategories.all[i]),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent(SearchState state) {
    // 1. Loading state
    if (state.isLoading) {
      return const SSPLoadingState(message: 'खोज जारी है...');
    }

    // 2. Error state
    if (state.error != null) {
      return SSPErrorState(
        message: state.error!,
        retryLabel: 'पुनः प्रयास करें',
        onRetry: () => ref.read(searchProvider.notifier).retry(),
      );
    }

    // 3. Search Results list (when results exist)
    if (state.results.isNotEmpty) {
      // The audio results, in result order, become the playback queue so
      // Previous/Next step through the search session.
      final audioQueue = state.results
          .where((r) => r.type == SearchContentType.audio && r.audio != null)
          .map((r) => r.audio!)
          .toList(growable: false);
      return ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: SSPSpacing.md,
          vertical: SSPSpacing.sm,
        ),
        itemCount: state.results.length,
        separatorBuilder: (_, __) => const SizedBox(height: SSPSpacing.sm),
        itemBuilder: (context, index) {
          final result = state.results[index];
          if (result.type == SearchContentType.audio) {
            return SSPAudioTile(
              title: result.title,
              subtitle: result.subtitle,
              artwork: ClipRRect(
                borderRadius: SSPRadius.brMedium,
                child: SSPImage(
                  result.imageUrl,
                  width: 56,
                  height: 56,
                  fit: BoxFit.cover,
                ),
              ),
              // Search opens the canonical Full Player, never a bare deep link
              // that leaves playback with nothing to show.
              onTap: () => ref.openPlayer(
                context,
                PlayerOpenRequest(
                  audioId: result.id,
                  audio: result.audio,
                  queue: audioQueue,
                  index: result.audio == null
                      ? 0
                      : audioQueue.indexOf(result.audio!),
                  source: 'search-audio',
                ),
              ),
              onPlayPause: () => ref.openPlayer(
                context,
                PlayerOpenRequest(
                  audioId: result.id,
                  audio: result.audio,
                  queue: audioQueue,
                  index: result.audio == null
                      ? 0
                      : audioQueue.indexOf(result.audio!),
                  source: 'search-audio-control',
                ),
              ),
            );
          }

          return SSPCard(
            onTap: () => context.push(result.routePath),
            padding: SSPSpacing.pSm,
            child: SSPListItem(
              leading: ClipRRect(
                borderRadius: SSPRadius.brSmall,
                child: SSPImage(
                  result.imageUrl,
                  width: 56,
                  height: 56,
                  fit: BoxFit.cover,
                ),
              ),
              title: result.title,
              subtitle: result.subtitle,
              subtitleMaxLines: 1,
              trailing: Chip(
                label: Text(
                  result.type.name.toUpperCase(),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                  ),
                ),
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              ),
              onTap: () => context.push(result.routePath),
            ),
          );
        },
      );
    }

    // 4. No results — the existing design-system empty state.
    final String queryText = state.query.isNotEmpty
        ? '"${state.query}"'
        : '"${state.selectedCategoryLabel}"';
    return SSPEmptyState(
      title: 'कोई परिणाम नहीं मिला',
      message: '$queryText से संबंधित कोई परिणाम नहीं मिला',
      icon: Icons.search_off_rounded,
      actionLabel: 'खोज साफ़ करें',
      onAction: _clearSearch,
    );
  }
}