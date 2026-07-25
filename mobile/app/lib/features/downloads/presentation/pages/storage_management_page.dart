import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/downloads_providers.dart';
import '../../../../shared/theme/app_spacing.dart';

class StorageManagementPage extends ConsumerWidget {
  const StorageManagementPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(storageStatisticsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Storage Management')),
      body: statsAsync.when(
        data: (stats) {
          final usedSpace = stats.totalSpace - stats.freeSpace;
          final usagePercent = usedSpace / stats.totalSpace;

          return ListView(
            padding: AppSpacing.paddingAllMd,
            children: [
              Card(
                child: Padding(
                  padding: AppSpacing.paddingAllMd,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Device Storage',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      LinearProgressIndicator(
                        value: usagePercent,
                        minHeight: 12,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${_formatSize(stats.freeSpace)} Free'),
                          Text('${_formatSize(stats.totalSpace)} Total'),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                'App Storage Usage',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: AppSpacing.md),
              ListTile(
                leading: const Icon(Icons.download),
                title: const Text('Downloads'),
                trailing: Text(_formatSize(stats.downloadsUsage)),
              ),
              ListTile(
                leading: const Icon(Icons.cached),
                title: const Text('Cache'),
                trailing: Text(_formatSize(stats.cacheUsage)),
              ),
              ListTile(
                leading: const Icon(Icons.apps),
                title: const Text('App Data'),
                trailing: Text(_formatSize(stats.appUsage)),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.delete_sweep, color: Colors.red),
                title: const Text(
                  'Clear Cache',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () {
                  // Implement cache clearing
                },
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  String _formatSize(int bytes) {
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}
