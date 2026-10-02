import '../../../../core/navigation/back_navigation_controller.dart';
import '../../../../core/player/canonical_player_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/audio_providers.dart';
import '../../domain/entities/playback_state_entity.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';
import '../../../search/domain/entities/search_category_definition.dart';
import '../../../search/domain/utils/search_text_utils.dart';

/// BhajanListPage matching `BhajanListScreen.tsx`.
/// Features: Top header with Indian motif, Search toggle, Category Chips filter,
/// Bhajan list items with thumbnail overlay play/pause, duration, direct favorite action.
class BhajanListPage extends ConsumerStatefulWidget {
  const BhajanListPage({super.key});

  @override
  ConsumerState<BhajanListPage> createState() => _BhajanListPageState();
}

class _BhajanListPageState extends ConsumerState<BhajanListPage> {
  bool _searchOpen = false;
  String _searchQuery = '';
  SearchCategoryId _selectedCategoryId = SearchCategoryId.allBhajan;

  String _formatDuration(Duration d) {
    if (d.inSeconds <= 0) return '04:15';
    final minutes = d.inMinutes;
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(audioHomeStateProvider);
    final playbackState = ref.watch(playbackStateProvider);
    final favorites = ref.watch(userFavoritesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final allBhajans = homeState.latestAudio;
    final selectedDef = SearchCategories.byId(_selectedCategoryId);

    final filteredBhajans = allBhajans.where((b) {
      return matchesAudioSearch(b, _searchQuery, selectedDef);
    }).toList();

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF181614)
          : const Color(0xFFFFFDF9),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: SafeArea(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF201D1A) : const Color(0xFFFAF7F2),
              border: Border(
                bottom: BorderSide(
                  color: isDark
                      ? const Color(0xFF292524)
                      : const Color(0xFFF0E6D8),
                ),
              ),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left_rounded, size: 28),
                  // Canonical policy: `/audio/bhajans` is a nested child of
                  // Audio, so Back pops to the page that opened it.
                  onPressed: () => ref
                      .read(backNavigationControllerProvider)
                      .handleBack(context, source: BackSource.appBar),
                  tooltip: 'पीछे जाएं',
                ),

                if (_searchOpen)
                  Expanded(
                    child: Container(
                      height: 40,
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1C1917) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isDark
                              ? Colors.amber.shade500.withValues(alpha: 0.5)
                              : Colors.amber.shade300,
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              autofocus: true,
                              onChanged: (val) =>
                                  setState(() => _searchQuery = val),
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark
                                    ? Colors.white
                                    : const Color(0xFF1C1917),
                              ),
                              decoration: const InputDecoration(
                                hintText: 'भजन खोजें...',
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _searchQuery = '';
                                _searchOpen = false;
                              });
                            },
                            child: const Icon(
                              Icons.close_rounded,
                              size: 18,
                              color: Color(0xFFA8A29E),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'संतमत भजन',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: isDark
                                ? const Color(0xFFF5F5F4)
                                : const Color(0xFF292524),
                          ),
                        ),
                        Text(
                          'मधुर आध्यात्मिक रचनाएँ',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? const Color(0xFFA8A29E)
                                : const Color(0xFF78716C),
                          ),
                        ),
                      ],
                    ),
                  ),

                IconButton(
                  icon: Icon(
                    _searchOpen
                        ? Icons.search_off_rounded
                        : Icons.search_rounded,
                    color: Colors.amber.shade700,
                  ),
                  onPressed: () {
                    setState(() => _searchOpen = !_searchOpen);
                  },
                  tooltip: 'खोजें',
                ),
              ],
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Category Chips Bar (Canonical 4 categories)
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: SearchCategories.all.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final catDef = SearchCategories.all[index];
                final isSelected = catDef.id == _selectedCategoryId;
                return ChoiceChip(
                  key: ValueKey('bhajan_list_cat_${catDef.id.name}'),
                  label: Text(catDef.uiLabel),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedCategoryId = catDef.id);
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

          // Bhajan Collection List
          Expanded(
            child: filteredBhajans.isEmpty
                ? const Center(
                    child: Text(
                      'कोई भजन नहीं मिला',
                      style: TextStyle(fontSize: 15, color: Color(0xFFA8A29E)),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                    itemCount: filteredBhajans.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final bhajan = filteredBhajans[index];
                      final isSelected =
                          playbackState.currentAudio?.id == bhajan.id;
                      final isPlayingThis =
                          isSelected &&
                          playbackState.status == PlaybackStatus.playing;
                      final isFav = favorites.contains(bhajan.id);

                      return Container(
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
                              queue: filteredBhajans,
                              index: index,
                              source: 'bhajan-list',
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
                                          width: 50,
                                          height: 50,
                                          child: SSPImage(
                                            bhajan.thumbnailUrl,
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        width: 50,
                                        height: 50,
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
                                            queue: filteredBhajans,
                                            index: index,
                                            source: 'bhajan-list',
                                          );
                                        },
                                        child: Container(
                                          width: 28,
                                          height: 28,
                                          decoration: BoxDecoration(
                                            color: Colors.white.withValues(
                                              alpha: 0.9,
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
                                        const SizedBox(height: 2),
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

                                  // Duration & Direct Favorite Action (No 3-dot menu)
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
                                        key: ValueKey('bhajan_list_fav_${bhajan.id}'),
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
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
