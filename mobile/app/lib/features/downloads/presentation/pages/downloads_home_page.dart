import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/downloads_providers.dart';
import '../widgets/download_state_widgets.dart';
import '../widgets/download_card.dart';
import '../../../../shared/theme/app_spacing.dart';

class DownloadsHomePage extends ConsumerWidget {
  const DownloadsHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(downloadsProvider);
    final notifier = ref.read(downloadsProvider.notifier);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Downloads'),
          actions: [
            IconButton(
              icon: const Icon(Icons.storage),
              onPressed: () => context.push('/downloads/storage'),
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Active'),
              Tab(text: 'Completed'),
            ],
          ),
        ),
        body: state.isLoading
            ? const DownloadsLoadingWidget()
            : state.error != null
            ? DownloadsErrorWidget(
                message: state.error!,
                onRetry: notifier.loadData,
              )
            : TabBarView(
                children: [
                  _buildList(context, state.activeDownloads, notifier),
                  _buildList(context, state.completedDownloads, notifier),
                ],
              ),
      ),
    );
  }

  Widget _buildList(
    BuildContext context,
    List downloads,
    DownloadsNotifier notifier,
  ) {
    if (downloads.isEmpty) {
      return const DownloadsEmptyWidget();
    }
    return RefreshIndicator(
      onRefresh: notifier.loadData,
      child: ListView.builder(
        padding: AppSpacing.p16,
        itemCount: downloads.length,
        itemBuilder: (context, index) {
          final dl = downloads[index];
          return DownloadCard(
            download: dl,
            onTap: () => context.push('/downloads/details/${dl.id}'),
            onPause: () => notifier.pause(dl.id),
            onResume: () => notifier.resume(dl.id),
            onCancel: () => notifier.cancel(dl.id),
            onRetry: () => notifier.retry(dl.id),
            onDelete: () => notifier.delete(dl.id),
          );
        },
      ),
    );
  }
}
