import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/library_providers.dart';
import '../widgets/library_state_widgets.dart';
import '../widgets/library_item_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class LibraryHomePage extends ConsumerWidget {
  const LibraryHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(libraryProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Library')),
      body: state.isLoading
          ? const LibraryLoadingWidget()
          : state.error != null
          ? LibraryErrorWidget(
              message: state.error!,
              onRetry: () => ref.read(libraryProvider.notifier).loadData(),
            )
          : RefreshIndicator(
              onRefresh: () => ref.read(libraryProvider.notifier).loadData(),
              child: ListView(
                padding: AppSpacing.paddingAllMd,
                children: [
                  _buildSectionHeader(
                    context,
                    'Recent Activity',
                    '/library/recent',
                  ),
                  if (state.recentActivities.isEmpty)
                    const LibraryEmptyWidget(
                      message: 'No recent activity',
                      icon: Icons.history,
                    )
                  else
                    ...state.recentActivities
                        .take(3)
                        .map(
                          (act) => LibraryItemCard(
                            item: act.item,
                            onTap: () => context.push(act.item.route),
                          ),
                        ),
                  const SizedBox(height: AppSpacing.lg),

                  _buildSectionHeader(
                    context,
                    'Favorites',
                    '/library/favorites',
                  ),
                  if (state.favorites.isEmpty)
                    const LibraryEmptyWidget(
                      message: 'No favorites yet',
                      icon: Icons.favorite_border,
                    )
                  else
                    ...state.favorites
                        .take(3)
                        .map(
                          (fav) => LibraryItemCard(
                            item: fav.item,
                            onTap: () => context.push(fav.item.route),
                          ),
                        ),
                  const SizedBox(height: AppSpacing.lg),

                  _buildSectionHeader(
                    context,
                    'Bookmarks',
                    '/library/bookmarks',
                  ),
                  if (state.bookmarks.isEmpty)
                    const LibraryEmptyWidget(
                      message: 'No bookmarks yet',
                      icon: Icons.bookmark_border,
                    )
                  else
                    ...state.bookmarks
                        .take(3)
                        .map(
                          (bm) => LibraryItemCard(
                            item: bm.item,
                            onTap: () => context.push(bm.item.route),
                          ),
                        ),
                  const SizedBox(height: AppSpacing.lg),

                  _buildSectionHeader(context, 'History', '/library/history'),
                  if (state.history.isEmpty)
                    const LibraryEmptyWidget(
                      message: 'No history',
                      icon: Icons.history,
                    )
                  else
                    ...state.history
                        .take(3)
                        .map(
                          (h) => LibraryItemCard(
                            item: h.item,
                            onTap: () => context.push(h.item.route),
                          ),
                        ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title, String route) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
          TextButton(
            onPressed: () => context.push(route),
            child: const Text('See All'),
          ),
        ],
      ),
    );
  }
}
