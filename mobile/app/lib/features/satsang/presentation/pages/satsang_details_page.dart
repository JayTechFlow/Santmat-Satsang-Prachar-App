import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/satsang_providers.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_state_widget.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../l10n/gen/app_localizations.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';


class SatsangDetailsPage extends ConsumerWidget {
  final String satsangId;

  const SatsangDetailsPage({super.key, required this.satsangId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final satsangAsync = ref.watch(satsangDetailsProvider(satsangId));
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: satsangAsync.when(
        loading: () => const Scaffold(body: SatsangLoadingWidget()),
        error: (err, stack) => Scaffold(
          appBar: AppBar(),
          body: SatsangErrorStateWidget(
            message: err.toString(),
            onRetry: () => ref.refresh(satsangDetailsProvider(satsangId)),
          ),
        ),
        data: (satsang) {
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 300,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: SSPImage(
                    satsang.coverImageUrl,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) =>
                        const ColoredBox(color: Colors.grey),
                  ),
                ),
                actions: [
                  IconButton(icon: const Icon(Icons.share), onPressed: () {}),
                  IconButton(
                    icon: const Icon(Icons.bookmark_border),
                    onPressed: () {},
                  ),
                ],
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: AppSpacing.p24,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        satsang.title,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: AppSpacing.sp4),
                      Text(
                        satsang.speaker.name,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                      ),
                      const SizedBox(height: AppSpacing.sp16),
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 16),
                          const SizedBox(width: AppSpacing.sp4),
                          Text('${satsang.duration.inMinutes} min'),
                          const SizedBox(width: AppSpacing.sp24),
                          const Icon(Icons.language, size: 16),
                          const SizedBox(width: AppSpacing.sp4),
                          Text(satsang.language),
                          const SizedBox(width: AppSpacing.sp24),
                          const Icon(Icons.category, size: 16),
                          const SizedBox(width: AppSpacing.sp4),
                          Text(satsang.category.name),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sp24),
                      Text(
                        l10n.description,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: AppSpacing.sp8),
                      Text(
                        satsang.description,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: AppSpacing.sp24),
                      Wrap(
                        spacing: 8,
                        children: satsang.tags.map((tag) {
                          return Chip(label: Text('#$tag'));
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
