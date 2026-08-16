import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/search_providers.dart';
import '../../../../shared/design_system/components/ssp_search_field.dart';
import '../../../../shared/design_system/components/ssp_loading_state.dart';
import '../../../../shared/design_system/components/ssp_error_state.dart';
import '../../../../shared/design_system/components/ssp_empty_state.dart';
import '../../../../shared/design_system/components/ssp_card.dart';
import '../../../../shared/design_system/components/ssp_list_item.dart';
import '../../../../shared/design_system/components/ssp_icon_button.dart';
import '../../../../shared/design_system/tokens/icons/ssp_icons.dart';
import '../../../../shared/design_system/tokens/spacing/ssp_spacing.dart';
import '../../../../shared/design_system/tokens/radius/ssp_radius.dart';
import '../../../../shared/design_system/tokens/colors/ssp_colors.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';
import '../../../../l10n/gen/app_localizations.dart';

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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchProvider);
    final recentSearchesAsync = ref.watch(recentSearchesProvider);
    final popularSearchesAsync = ref.watch(popularSearchesProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: SSPSearchField(
          controller: _searchController,
          focusNode: _searchFocusNode,
          hintText: l10n.searchSatsangs ?? 'Search everywhere...',
          onChanged: (val) {
            ref.read(searchProvider.notifier).updateQuery(val);
          },
          onSubmitted: (val) {
            ref.read(searchProvider.notifier).performSearch(val);
          },
          onClear: () {
            _searchController.clear();
            ref.read(searchProvider.notifier).updateQuery('');
          },
          showClearButton: true,
          autofocus: true,
        ),
        automaticallyImplyLeading: false,
      ),
      body: state.isLoading
          ? const SSPLoadingState(message: 'Searching...')
          : state.error != null
          ? SSPErrorState(
              message: state.error!,
              onRetry: () =>
                  ref.read(searchProvider.notifier).performSearch(state.query),
            )
          : state.results.isNotEmpty
          ? ListView.builder(
              padding: SSPSpacing.pMd,
              itemCount: state.results.length,
              itemBuilder: (context, index) {
                final result = state.results[index];
                return SSPCard(
                  onTap: () => context.push(result.routePath),
                  padding: SSPSpacing.pSm,
                  child: SSPListItem(
                    leading: ClipRRect(
                      borderRadius: SSPRadius.brSmall,
                      child: SSPImage(
                        result.imageUrl,
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          width: 60,
                          height: 60,
                          color: Colors.grey.shade300,
                          child: const Icon(Icons.image),
                        ),
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
            )
          : state.query.isEmpty
          ? ListView(
              children: [
                recentSearchesAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (history) {
                    if (history.isEmpty) return const SizedBox.shrink();
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: SSPSpacing.pMd,
                          child: Text(
                            'Recent Searches',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                        ...history.map(
                          (recent) => SSPListItem(
                            leading: Icon(Icons.history_rounded, color: SSPColors.textTertiary(context)),
                            title: recent.query,
                            trailing: SSPIconButton(
                              icon: const Icon(SSPIcons.close, size: 18),
                              semanticLabel: 'Remove from history',
                              onPressed: () async {
                                await ref
                                    .read(deleteRecentSearchUseCaseProvider)
                                    .call(recent.query);
                                ref.invalidate(recentSearchesProvider);
                              },
                            ),
                            onTap: () {
                              _searchController.text = recent.query;
                              ref.read(searchProvider.notifier).performSearch(recent.query);
                            },
                          ),
                        ),
                      ],
                    );
                  },
                ),
                popularSearchesAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (popular) {
                    if (popular.isEmpty) return const SizedBox.shrink();
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: SSPSpacing.pMd,
                          child: Text(
                            'Popular Searches',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: SSPSpacing.md),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: popular.map((query) => ActionChip(
                              label: Text(query),
                              onPressed: () {
                                _searchController.text = query;
                                ref.read(searchProvider.notifier).performSearch(query);
                              },
                            )).toList(),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ],
            )
          : SSPEmptyState(
              title: 'No Results',
              message: 'No results found for "${state.query}". Try adjusting your search.',
              actionLabel: 'Clear Search',
              onAction: () {
                _searchController.clear();
                ref.read(searchProvider.notifier).updateQuery('');
              },
            ),
    );
  }
}