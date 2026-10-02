import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/data_providers.dart';
import '../../../../l10n/gen/app_localizations.dart';
import '../../../../shared/design_system/components/ssp_app_bar.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/widgets/ssp_image.dart';
import '../../domain/entities/satsang_category_entity.dart';
import '../../domain/entities/satsang_entity.dart';
import '../../domain/entities/satsang_filter_entity.dart';
import '../providers/satsang_providers.dart';

final categorySatsangsProvider = FutureProvider.family<List<SatsangEntity>, String>((ref, categoryId) async {
  final repository = ref.watch(satsangRepositoryProvider);
  final filter = SatsangFilterEntity(categoryId: categoryId);
  final result = await repository.filterSatsangs(filter);
  if (result.isSuccess) {
    return result.data ?? [];
  }
  return [];
});

class CategoryPage extends ConsumerStatefulWidget {
  final String categoryId;

  const CategoryPage({super.key, required this.categoryId});

  @override
  ConsumerState<CategoryPage> createState() => _CategoryPageState();
}

class _CategoryPageState extends ConsumerState<CategoryPage> {
  String _searchQuery = '';
  String _selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final homeState = ref.watch(satsangHomeStateProvider);
    final categorySatsangsAsync = ref.watch(categorySatsangsProvider(widget.categoryId));

    SatsangCategoryEntity? activeCategory;
    for (final cat in homeState.categories) {
      if (cat.id == widget.categoryId) {
        activeCategory = cat;
        break;
      }
    }
    final categoryName = activeCategory?.name ?? l10n.category;

    return Scaffold(
      appBar: SSPAppBar(
        title: categoryName,
      ),
      body: categorySatsangsAsync.when(
        loading: () => const SSPLoadingState(),
        error: (err, stack) => SSPErrorState(
          message: err.toString(),
          onRetry: () => ref.refresh(categorySatsangsProvider(widget.categoryId)),
        ),
        data: (satsangs) {
          final allSatsangs = satsangs.isNotEmpty
              ? satsangs
              : [...homeState.featuredSatsangs, ...homeState.latestSatsangs, ...homeState.popularSatsangs];

          var filteredList = allSatsangs.where((s) {
            if (_searchQuery.isNotEmpty) {
              final q = _searchQuery.toLowerCase();
              return s.title.toLowerCase().contains(q) ||
                  s.speaker.name.toLowerCase().contains(q) ||
                  s.description.toLowerCase().contains(q);
            }
            return true;
          }).toList();

          if (_selectedFilter == 'popular') {
            filteredList = filteredList.where((s) => s.isPopular).toList();
          } else if (_selectedFilter == 'recent') {
            filteredList = filteredList.where((s) => s.isRecentlyAdded).toList();
          }

          return CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverToBoxAdapter(
                child: _buildCategoryHeader(theme, isDark, categoryName, filteredList.length),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    children: [
                      TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText: 'श्रेणी में सत्संग खोजें...',
                          prefixIcon: const Icon(Icons.search),
                          filled: true,
                          fillColor: isDark ? const Color(0xFF24201C) : const Color(0xFFFAF7F2),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: isDark ? const Color(0xFF292524) : const Color(0xFFE5E7EB),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: isDark ? const Color(0xFF292524) : const Color(0xFFE5E7EB),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _buildFilterChip('सभी', 'all', isDark),
                          const SizedBox(width: 8),
                          _buildFilterChip('लोकप्रिय', 'popular', isDark),
                          const SizedBox(width: 8),
                          _buildFilterChip('नवीनतम', 'recent', isDark),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              if (filteredList.isEmpty)
                const SliverFillRemaining(
                  child: SSPEmptyState(
                    title: 'कोई सत्संग नहीं मिला',
                    message: 'कृपया अपनी खोज शब्द बदलें।',
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final item = filteredList[index];
                        return _buildSpiritualSatsangCard(theme, isDark, item);
                      },
                      childCount: filteredList.length,
                    ),
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 40)),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCategoryHeader(ThemeData theme, bool isDark, String categoryName, int count) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isDark
              ? [const Color(0xFF33251A), const Color(0xFF1E1A16)]
              : [const Color(0xFF7F1D1D), const Color(0xFFB45309)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 60 : 30),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.menu_book, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      categoryName,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'कुल $count सत्संग प्रवचन',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withAlpha(200),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'आध्यात्मिक चेतना, ध्यान साधना एवं गुरु वचनों का पावन संग्रह।',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: Colors.white.withAlpha(220),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, bool isDark) {
    final isSelected = _selectedFilter == value;
    return ChoiceChip(
      showCheckmark: false,
      label: Text(label),
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
        color: isSelected
            ? Colors.white
            : (isDark ? const Color(0xFFD6D3D1) : const Color(0xFF374151)),
      ),
      selected: isSelected,
      selectedColor: isDark ? Colors.amber.shade700 : const Color(0xFFB45309),
      backgroundColor: isDark ? const Color(0xFF24201C) : const Color(0xFFF3F4F6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isSelected
              ? Colors.transparent
              : (isDark ? const Color(0xFF44403C) : const Color(0xFFE5E7EB)),
        ),
      ),
      onSelected: (selected) {
        if (selected) {
          setState(() => _selectedFilter = value);
        }
      },
    );
  }

  Widget _buildSpiritualSatsangCard(ThemeData theme, bool isDark, SatsangEntity satsang) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF221E1A) : const Color(0xFFFFFDF9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0xFF292524) : const Color(0xFFF0E6D8),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 40 : 12),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          context.push('/satsang/details/${satsang.id}');
        },
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  width: 100,
                  height: 90,
                  child: SSPImage(
                    satsang.thumbnailUrl.isNotEmpty
                        ? satsang.thumbnailUrl
                        : satsang.coverImageUrl,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(
                      color: isDark ? const Color(0xFF332D27) : const Color(0xFFFEF3C7),
                      child: Icon(
                        Icons.self_improvement,
                        color: isDark ? Colors.amber.shade400 : const Color(0xFFB45309),
                        size: 32,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      satsang.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : const Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.person_outline,
                          size: 14,
                          color: isDark ? Colors.amber.shade400 : const Color(0xFFB45309),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            satsang.speaker.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? Colors.amber.shade300 : const Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF332D27) : const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${satsang.duration.inMinutes} मिनट',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDark ? const Color(0xFFD6D3D1) : const Color(0xFF44403C),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? Colors.amber.shade900.withAlpha(70) : const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            satsang.language,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.amber.shade300 : const Color(0xFF92400E),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
