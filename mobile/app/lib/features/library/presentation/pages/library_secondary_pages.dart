import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/library_providers.dart';
import '../widgets/library_state_widgets.dart';
import '../widgets/library_item_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class LibraryFavoritesPage extends ConsumerWidget {
  const LibraryFavoritesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(libraryProvider);
    final notifier = ref.read(libraryProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: state.favorites.isEmpty
          ? const LibraryEmptyWidget(
              message: 'No favorites yet',
              icon: Icons.favorite_border,
            )
          : ListView.builder(
              padding: AppSpacing.paddingAllMd,
              itemCount: state.favorites.length,
              itemBuilder: (context, index) {
                final item = state.favorites[index].item;
                return LibraryItemCard(
                  item: item,
                  onTap: () => context.push(item.route),
                  onFavoriteToggle: () =>
                      notifier.toggleFavorite(item.contentId, item.contentType),
                );
              },
            ),
    );
  }
}

class LibraryBookmarksPage extends ConsumerWidget {
  const LibraryBookmarksPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(libraryProvider);
    final notifier = ref.read(libraryProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Bookmarks')),
      body: state.bookmarks.isEmpty
          ? const LibraryEmptyWidget(
              message: 'No bookmarks yet',
              icon: Icons.bookmark_border,
            )
          : ListView.builder(
              padding: AppSpacing.paddingAllMd,
              itemCount: state.bookmarks.length,
              itemBuilder: (context, index) {
                final item = state.bookmarks[index].item;
                return LibraryItemCard(
                  item: item,
                  onTap: () => context.push(item.route),
                  onBookmarkToggle: () =>
                      notifier.removeBookmark(item.contentId, item.contentType),
                );
              },
            ),
    );
  }
}

class LibraryHistoryPage extends ConsumerWidget {
  const LibraryHistoryPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(libraryProvider);
    final notifier = ref.read(libraryProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('History'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_sweep),
            onPressed: () => notifier.clearHistory(),
          ),
        ],
      ),
      body: state.history.isEmpty
          ? const LibraryEmptyWidget(message: 'No history', icon: Icons.history)
          : ListView.builder(
              padding: AppSpacing.paddingAllMd,
              itemCount: state.history.length,
              itemBuilder: (context, index) {
                final hist = state.history[index];
                return LibraryItemCard(
                  item: hist.item,
                  onTap: () => context.push(hist.item.route),
                  onDelete: () => notifier.deleteHistory(hist.id),
                );
              },
            ),
    );
  }
}

class LibraryRecentActivityPage extends ConsumerWidget {
  const LibraryRecentActivityPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(libraryProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Recent Activity')),
      body: state.recentActivities.isEmpty
          ? const LibraryEmptyWidget(
              message: 'No recent activity',
              icon: Icons.history,
            )
          : ListView.builder(
              padding: AppSpacing.paddingAllMd,
              itemCount: state.recentActivities.length,
              itemBuilder: (context, index) {
                final act = state.recentActivities[index];
                return LibraryItemCard(
                  item: act.item,
                  onTap: () => context.push(act.item.route),
                );
              },
            ),
    );
  }
}
