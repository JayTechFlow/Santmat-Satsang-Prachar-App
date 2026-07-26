import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/search_providers.dart';
import '../widgets/search_state_widgets.dart';
import '../widgets/search_result_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class SearchHomePage extends ConsumerStatefulWidget {
  const SearchHomePage({super.key});

  @override
  ConsumerState<SearchHomePage> createState() => _SearchHomePageState();
}

class _SearchHomePageState extends ConsumerState<SearchHomePage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchProvider);
    final recentSearchesAsync = ref.watch(recentSearchesProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Search everywhere...',
            border: InputBorder.none,
            suffixIcon: state.query.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _searchController.clear();
                      ref.read(searchProvider.notifier).updateQuery('');
                    },
                  )
                : null,
          ),
          onChanged: (val) {
            ref.read(searchProvider.notifier).updateQuery(val);
          },
          onSubmitted: (val) {
            ref.read(searchProvider.notifier).performSearch(val);
          },
        ),
      ),
      body: state.isLoading
          ? const SearchLoadingWidget()
          : state.error != null
          ? SearchErrorWidget(
              message: state.error!,
              onRetry: () =>
                  ref.read(searchProvider.notifier).performSearch(state.query),
            )
          : state.results.isNotEmpty
          ? ListView.builder(
              padding: AppSpacing.p16,
              itemCount: state.results.length,
              itemBuilder: (context, index) {
                final result = state.results[index];
                return SearchResultCard(
                  result: result,
                  onTap: () => context.push(result.routePath),
                );
              },
            )
          : state.query.isEmpty
          ? recentSearchesAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
              data: (history) {
                if (history.isEmpty) return const SizedBox.shrink();
                return ListView.builder(
                  itemCount: history.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return const Padding(
                        padding: EdgeInsets.all(AppSpacing.sp16),
                        child: Text(
                          'Recent Searches',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      );
                    }
                    final recent = history[index - 1];
                    return ListTile(
                      leading: const Icon(Icons.history),
                      title: Text(recent.query),
                      trailing: IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () async {
                          await ref
                              .read(deleteRecentSearchUseCaseProvider)
                              .call(recent.query);
                          ref.invalidate(recentSearchesProvider);
                        },
                      ),
                      onTap: () {
                        _searchController.text = recent.query;
                        ref
                            .read(searchProvider.notifier)
                            .performSearch(recent.query);
                      },
                    );
                  },
                );
              },
            )
          : const NoResultsWidget(),
    );
  }
}
