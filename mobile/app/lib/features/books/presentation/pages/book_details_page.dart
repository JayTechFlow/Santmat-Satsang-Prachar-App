import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/books_providers.dart';
import '../widgets/books_state_widgets.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import '../../../../l10n/gen/app_localizations.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';


class BookDetailsPage extends ConsumerWidget {
  final String bookId;

  const BookDetailsPage({super.key, required this.bookId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookAsync = ref.watch(bookDetailsProvider(bookId));
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: () {}),
          IconButton(icon: const Icon(Icons.bookmark_border), onPressed: () {}),
        ],
      ),
      body: bookAsync.when(
        loading: () => const BooksLoadingWidget(),
        error: (err, stack) => BooksErrorWidget(
          message: err.toString(),
          onRetry: () => ref.refresh(bookDetailsProvider(bookId)),
        ),
        data: (book) {
          return SingleChildScrollView(
            padding: AppSpacing.p24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Hero(
                  tag: 'book_cover_${book.id}',
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: SSPImage(
                      book.coverImageUrl,
                      width: 200,
                      height: 300,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        width: 200,
                        height: 300,
                        color: Colors.grey.shade300,
                        child: const Icon(Icons.book, size: 80),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.sp24),
                Text(
                  book.title,
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                if (book.subtitle.isNotEmpty) ...[
                  const SizedBox(height: AppSpacing.sp4),
                  Text(
                    book.subtitle,
                    style: Theme.of(context).textTheme.titleMedium,
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: AppSpacing.sp8),
                Text(
                  book.author.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.sp24),

                // Read Button
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () {
                      // Trigger Read logic
                    },
                    icon: const Icon(Icons.menu_book),
                    label: const Text('Read Now'),
                  ),
                ),
                const SizedBox(height: AppSpacing.sp24),

                // Details
                Align(
                  alignment: Alignment.centerLeft,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.description,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: AppSpacing.sp8),
                      Text(book.description),
                      const SizedBox(height: AppSpacing.sp24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildDetailChip(
                            context,
                            Icons.category,
                            book.category.name,
                          ),
                          _buildDetailChip(
                            context,
                            Icons.language,
                            book.language,
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sp16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildDetailChip(
                            context,
                            Icons.pages,
                            '${book.pageCount} pages',
                          ),
                          _buildDetailChip(
                            context,
                            Icons.timer,
                            '${book.estimatedReadingTime.inHours}h ${book.estimatedReadingTime.inMinutes % 60}m',
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.sp16),
                      _buildDetailChip(
                        context,
                        Icons.info_outline,
                        book.edition,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailChip(BuildContext context, IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 16,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
        const SizedBox(width: AppSpacing.sp4),
        Text(
          text,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
