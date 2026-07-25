import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/books_providers.dart';
import '../widgets/books_state_widgets.dart';
import '../widgets/featured_book_card.dart';
import '../widgets/book_category_section.dart';
import '../widgets/continue_reading_card.dart';
import '../widgets/book_card.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../l10n/gen/app_localizations.dart';

class BooksHomePage extends ConsumerWidget {
  const BooksHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(booksHomeStateProvider);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.books),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark),
            onPressed: () => context.push('/books/bookmarks'),
          ),
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => context.push('/books/history'),
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {}, // Future search functionality
          ),
        ],
      ),
      body: state.isLoading
          ? const BooksLoadingWidget()
          : state.error != null
          ? BooksErrorWidget(
              message: state.error!,
              onRetry: () =>
                  ref.read(booksHomeStateProvider.notifier).loadHomeData(),
            )
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(booksHomeStateProvider.notifier).loadHomeData(),
              child: CustomScrollView(
                slivers: [
                  if (state.readingHistory.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.sm,
                            ),
                            child: Text(
                              'Continue Reading',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          ContinueReadingCard(
                            progress: state.readingHistory.first,
                            onTap: () => context.push(
                              '/books/details/${state.readingHistory.first.book.id}',
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (state.featuredBooks.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.sm,
                            ),
                            child: Text(
                              'Featured Books',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          SizedBox(
                            height: 260,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: state.featuredBooks.length,
                              itemBuilder: (context, index) {
                                return FeaturedBookCard(
                                  book: state.featuredBooks[index],
                                  onTap: () => context.push(
                                    '/books/details/${state.featuredBooks[index].id}',
                                  ),
                                );
                              },
                            ),
                          ),
                          const SizedBox(height: AppSpacing.md),
                        ],
                      ),
                    ),
                  SliverToBoxAdapter(
                    child: BookCategorySection(
                      title: l10n.categories,
                      categories: state.categories,
                      onCategoryTap: (category) =>
                          context.push('/books/category/${category.id}'),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      child: Text(
                        'Popular Books',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                        ),
                        child: BookCard(
                          book: state.popularBooks[index],
                          onTap: () => context.push(
                            '/books/details/${state.popularBooks[index].id}',
                          ),
                        ),
                      );
                    }, childCount: state.popularBooks.length),
                  ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
                ],
              ),
            ),
    );
  }
}
