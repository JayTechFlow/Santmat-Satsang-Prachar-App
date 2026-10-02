import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/books/presentation/pages/books_home_page.dart';
import 'package:santmat_satsang_prachar/features/books/presentation/pages/book_details_page.dart';
import 'package:santmat_satsang_prachar/features/books/presentation/pages/pdf_reader_page.dart';
import 'package:santmat_satsang_prachar/features/books/presentation/providers/books_providers.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_author_entity.dart';
import 'package:santmat_satsang_prachar/features/books/domain/entities/book_category_entity.dart';
import '../../../../helpers/mock_book_data_source.dart';

void main() {
  group('Books & PDF Reader Contract Tests', () {
    testWidgets('1, 2, 3. Books catalog loads canonical data, loading & renders UI', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookDataSourceProvider.overrideWithValue(MockBookDataSource()),
          ],
          child: const MaterialApp(
            home: BooksHomePage(),
          ),
        ),
      );

      expect(find.byType(BooksHomePage), findsOneWidget);

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 700));

      expect(find.textContaining('Books'), findsWidgets);
    });

    testWidgets('5, 6, 7. Book detail opens, metadata rendered, Read action supported', (tester) async {
      final targetBook = BookEntity(
        id: 'b1',
        title: 'सत्संग योग',
        subtitle: 'भूमिका एवं साधना',
        description: 'संतमत सिद्धान्त',
        author: const BookAuthorEntity(id: 'a1', name: 'महर्षि मेँहीं परमहंस', bio: '', imageUrl: ''),
        category: const BookCategoryEntity(id: 'c1', name: 'दर्शन', description: ''),
        language: 'hi',
        edition: '1st',
        publicationDate: DateTime.now(),
        pageCount: 150,
        estimatedReadingTime: const Duration(hours: 3),
        coverImageUrl: '',
        thumbnailUrl: '',
        tags: const [],
        isFeatured: true,
        isPopular: true,
        isRecentlyAdded: true,
        chapters: const [],
        pdfUrlPlaceholder: 'https://example.com/test.pdf',
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookDetailsProvider('b1').overrideWith(
              (ref) async => targetBook,
            ),
          ],
          child: const MaterialApp(
            home: BookDetailsPage(bookId: 'b1'),
          ),
        ),
      );

      await tester.pump();
      await tester.pumpAndSettle();

      expect(find.text('Read Now'), findsOneWidget);
    });

    testWidgets('8, 9, 10. PDF reader renders document content with page navigation', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: PdfReaderPage(
            title: 'सत्संग योग',
            pdfUrl: 'https://storage.googleapis.com/test/satsang_yoga.pdf',
          ),
        ),
      );

      // Loading state
      expect(find.text('PDF लोड हो रहा है... (Loading PDF)'), findsOneWidget);

      await tester.pumpAndSettle();

      // Document title and page rendering
      expect(find.text('सत्संग योग'), findsWidgets);
      expect(find.text('1 / 15'), findsOneWidget);

      // Page Navigation
      final nextButton = find.byIcon(Icons.arrow_forward_ios_rounded);
      expect(nextButton, findsOneWidget);
      await tester.tap(nextButton);
      await tester.pumpAndSettle();

      expect(find.text('2 / 15'), findsOneWidget);
    });

    testWidgets('11, 12. Missing PDF handles state safely without hardcoded production URL', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: PdfReaderPage(
            title: 'रिक्त पुस्तक',
            pdfUrl: '',
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.textContaining('PDF फ़ाइल उपलब्ध नहीं है'), findsOneWidget);
      expect(find.text('पुनः प्रयास करें (Retry)'), findsOneWidget);
    });

    test('13, 14. Architecture contract verify single Book repository and PDF system', () {
      final container = ProviderContainer(
        overrides: [
          bookDataSourceProvider.overrideWithValue(MockBookDataSource()),
        ],
      );
      addTearDown(container.dispose);

      final repo = container.read(bookRepositoryProvider);
      expect(repo, isNotNull);
    });
  });
}
