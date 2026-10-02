import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/components/ssp_icon_button.dart';
import '../../../../shared/design_system/components/ssp_search_field.dart';
import '../../../../shared/design_system/components/ssp_section_header.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';

import '../../../../core/player/canonical_player_controller.dart';
import '../../../../l10n/gen/app_localizations.dart';
import '../providers/audio_providers.dart';
import '../../domain/entities/playback_state_entity.dart';
import '../../../search/domain/entities/search_category_definition.dart';
import '../../../search/domain/utils/search_text_utils.dart';

class AudioHomePage extends ConsumerStatefulWidget {
  const AudioHomePage({super.key});

  @override
  ConsumerState<AudioHomePage> createState() => _AudioHomePageState();
}

class _AudioHomePageState extends ConsumerState<AudioHomePage> {
  SearchCategoryId _selectedCategoryId = SearchCategoryId.allBhajan;
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _searchQuery = '';
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  String _formatDuration(Duration d) {
    if (d.inSeconds <= 0) return '04:15';
    final minutes = d.inMinutes;
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  void _closeSearch() {
    setState(() {
      _isSearching = false;
      _searchQuery = '';
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(audioHomeStateProvider);
    final playbackState = ref.watch(playbackStateProvider);
    final favorites = ref.watch(userFavoritesProvider);
    final l10n = AppLocalizations.of(context)!;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (state.isLoading && state.latestAudio.isEmpty) {
      return Scaffold(
        appBar: SSPAppBar.standard(
          title: l10n.audio,
          subtitle: 'भजन, कीर्तन एवं सत्संग प्रवचन',
        ),
        body: const SSPLoadingState(),
      );
    }

    final allBhajans = state.latestAudio;
    final selectedDef = SearchCategories.byId(_selectedCategoryId);

    final filteredList = allBhajans.where((b) {
      return matchesAudioSearch(b, _searchQuery, selectedDef);
    }).toList();

    return PopScope(
      canPop: !_isSearching,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_isSearching) {
          _closeSearch();
        }
      },
      child: Scaffold(
        backgroundColor: isDark
            ? const Color(0xFF181614)
            : const Color(0xFFFFFDF9),
        appBar: _isSearching
            ? AppBar(
                backgroundColor: isDark
                    ? const Color(0xFF181614)
                    : const Color(0xFF7F1D1D),
                elevation: 0,
                scrolledUnderElevation: 0,
                leading: SSPIconButton(
                  icon: const Icon(
                    Icons.arrow_back_rounded,
                    color: Color(0xFFFDE68A),
                  ),
                  semanticLabel: 'पीछे जाएं',
                  onPressed: _closeSearch,
                ),
                titleSpacing: 0,
                title: Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: SSPSearchField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    hintText: 'भजन, गायक या श्रेणी खोजें...',
                    onChanged: (val) => setState(() => _searchQuery = val),
                    onClear: () {
                      _searchController.clear();
                      setState(() => _searchQuery = '');
                    },
                    showClearButton: true,
                    autofocus: true,
                  ),
                ),
                automaticallyImplyLeading: false,
              )
            : SSPAppBar.standard(
                title: l10n.audio,
                subtitle: 'भजन, कीर्तन एवं सत्संग प्रवचन',
                automaticallyImplyLeading: false,
                actions: [
                  IconButton(
                    icon: const Icon(
                      Icons.search_rounded,
                      color: Color(0xFFFDE68A),
                    ),
                    tooltip: 'खोजें',
                    onPressed: () {
                      setState(() {
                        _isSearching = true;
                      });
                    },
                  ),
                ],
              ),
        body: RefreshIndicator(
          onRefresh: () =>
              ref.read(audioHomeStateProvider.notifier).loadHomeData(),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            slivers: [
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppSpacing.gapH16,

                    // Category Chips Bar (Always the canonical 4 categories in order)
                    SizedBox(
                      height: 44,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: SearchCategories.all.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final categoryDef = SearchCategories.all[index];
                          final isSelected =
                              categoryDef.id == _selectedCategoryId;
                          return ChoiceChip(
                            key: ValueKey('audio_cat_${categoryDef.id.name}'),
                            label: Text(categoryDef.uiLabel),
                            selected: isSelected,
                            onSelected: (selected) {
                              if (selected) {
                                setState(() =>
                                    _selectedCategoryId = categoryDef.id);
                              }
                            },
                            selectedColor: Colors.amber.shade700,
                            backgroundColor: isDark
                                ? const Color(0xFF1C1917)
                                : const Color(0xFFF3EBE0),
                            labelStyle: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected
                                  ? Colors.white
                                  : isDark
                                  ? const Color(0xFFD6D3D1)
                                  : const Color(0xFF292524),
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: BorderSide(
                                color: isSelected
                                    ? Colors.amber.shade700
                                    : isDark
                                    ? const Color(0xFF292524)
                                    : const Color(0xFFE5DACE),
                              ),
                            ),
                            visualDensity: VisualDensity.compact,
                          );
                        },
                      ),
                    ),

                    AppSpacing.gapH16,
                    const SSPSectionHeader(title: 'संतमत भजन संग्रह'),
                  ],
                ),
              ),

              if (filteredList.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: SSPEmptyState(
                    title: 'कोई भजन नहीं मिला',
                    message: _searchQuery.isNotEmpty
                        ? '"$_searchQuery" से संबंधित कोई भजन नहीं मिला'
                        : '"${selectedDef?.uiLabel ?? ''}" श्रेणी में कोई भजन उपलब्ध नहीं है',
                    icon: Icons.music_off_rounded,
                    actionLabel:
                        _searchQuery.isNotEmpty ? 'खोज साफ़ करें' : null,
                    onAction: _searchQuery.isNotEmpty
                        ? () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          }
                        : null,
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final bhajan = filteredList[index];
                      final isSelected =
                          playbackState.currentAudio?.id == bhajan.id;
                      final isPlayingThis =
                          isSelected &&
                          playbackState.status == PlaybackStatus.playing;
                      final isFav = favorites.contains(bhajan.id);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? isDark
                                    ? Colors.amber.shade500
                                          .withValues(alpha: 0.15)
                                    : Colors.amber.shade50
                              : isDark
                              ? const Color(0xFF221F1C)
                              : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected
                                ? Colors.amber.shade400
                                : isDark
                                ? const Color(0xFF292524)
                                : const Color(0xFFF2E8DC),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () => ref.openAudio(
                              context,
                              bhajan,
                              queue: filteredList,
                              index: index,
                              source: 'audio-home',
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(10),
                              child: Row(
                                children: [
                                  // Thumbnail poster card with Play/Pause button
                                  Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(10),
                                        child: SizedBox(
                                          width: 54,
                                          height: 54,
                                          child: SSPImage(
                                            bhajan.thumbnailUrl,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        width: 54,
                                        height: 54,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                          gradient: LinearGradient(
                                            begin: Alignment.bottomCenter,
                                            end: Alignment.topCenter,
                                            colors: [
                                              Colors.black.withValues(alpha: 0.6),
                                              Colors.transparent,
                                            ],
                                          ),
                                        ),
                                      ),
                                      GestureDetector(
                                        onTap: () {
                                          if (isSelected) {
                                            ref
                                                .read(
                                                  playbackStateProvider.notifier,
                                                )
                                                .togglePlayPause();
                                            return;
                                          }
                                          ref.openAudio(
                                            context,
                                            bhajan,
                                            queue: filteredList,
                                            index: index,
                                            source: 'audio-home',
                                          );
                                        },
                                        child: Tooltip(
                                          message: isPlayingThis
                                              ? 'रोकें'
                                              : 'पूर्ण प्लेयर खोलें',
                                          child: Container(
                                            width: 30,
                                            height: 30,
                                            decoration: BoxDecoration(
                                              color: Colors.white.withValues(
                                                alpha: 0.92,
                                              ),
                                              shape: BoxShape.circle,
                                              boxShadow: const [
                                                BoxShadow(
                                                  color: Colors.black26,
                                                  blurRadius: 4,
                                                ),
                                              ],
                                            ),
                                            child: Icon(
                                              isPlayingThis
                                                  ? Icons.pause_rounded
                                                  : Icons.play_arrow_rounded,
                                              color: Colors.amber.shade900,
                                              size: 18,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(width: 12),

                                  // Title & Subtitle
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          bhajan.title,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: isSelected
                                                ? FontWeight.w900
                                                : FontWeight.bold,
                                            color: isSelected
                                                ? Colors.amber.shade700
                                                : isDark
                                                ? const Color(0xFFF5F5F4)
                                                : const Color(0xFF1C1917),
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          bhajan.speaker,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: isDark
                                                ? const Color(0xFFA8A29E)
                                                : const Color(0xFF78716C),
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),

                                  // Duration & Favorite Direct Action
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        _formatDuration(bhajan.duration),
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFFA8A29E),
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      IconButton(
                                        key: ValueKey('fav_${bhajan.id}'),
                                        icon: Icon(
                                          isFav
                                              ? Icons.favorite_rounded
                                              : Icons.favorite_border_rounded,
                                          size: 20,
                                          color: isFav
                                              ? Colors.red
                                              : (isDark
                                                  ? const Color(0xFFA8A29E)
                                                  : const Color(0xFF78716C)),
                                        ),
                                        tooltip: isFav
                                            ? 'पसंदीदा से हटाएं'
                                            : 'पसंदीदा में जोड़ें',
                                        onPressed: () {
                                          ref
                                              .read(
                                                userFavoritesProvider.notifier,
                                              )
                                              .toggleFavorite(bhajan.id);
                                        },
                                        padding: EdgeInsets.zero,
                                        constraints: const BoxConstraints(
                                          minWidth: 36,
                                          minHeight: 36,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    }, childCount: filteredList.length),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
