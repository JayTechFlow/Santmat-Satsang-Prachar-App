import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/book_author_entity.dart';
import '../../domain/entities/book_chapter_entity.dart';
import '../../domain/entities/book_filter_entity.dart';
import '../../domain/entities/book_bookmark_entity.dart';
import '../../domain/entities/reading_progress_entity.dart';

class MockBookDataSource {
  final List<BookCategoryEntity> _categories = [
    const BookCategoryEntity(
      id: 'bc1',
      name: 'Philosophy',
      description: 'Core philosophy of Santmat',
    ),
    const BookCategoryEntity(
      id: 'bc2',
      name: 'Biographies',
      description: 'Lives of great Saints',
    ),
    const BookCategoryEntity(
      id: 'bc3',
      name: 'Poetry',
      description: 'Mystic poetry and verses',
    ),
  ];

  final List<BookAuthorEntity> _authors = [
    const BookAuthorEntity(
      id: 'a1',
      name: 'Maharshi Mehi Paramhans',
      bio: 'Great saint of the 20th century.',
      imageUrl: 'https://picsum.photos/seed/a1/200/200',
    ),
    const BookAuthorEntity(
      id: 'a2',
      name: 'Sant Tulsi Sahib',
      bio: 'Mystic saint of Hathras.',
      imageUrl: 'https://picsum.photos/seed/a2/200/200',
    ),
  ];

  late final List<BookEntity> _books;

  MockBookDataSource() {
    _books = List.generate(10, (index) {
      return BookEntity(
        id: 'book_$index',
        title: 'Santmat Book ${index + 1}',
        subtitle: 'The path of saints ${index + 1}',
        description:
            'This is a detailed description of the book which contains deep spiritual insights and the core teachings of Santmat.',
        author: _authors[index % _authors.length],
        category: _categories[index % _categories.length],
        language: index % 3 == 0 ? 'English' : 'Hindi',
        edition: '1st Edition',
        publicationDate: DateTime.now().subtract(Duration(days: index * 100)),
        pageCount: 150 + (index * 50),
        estimatedReadingTime: Duration(hours: 3 + index),
        coverImageUrl: 'https://picsum.photos/seed/book_$index/300/450',
        thumbnailUrl: 'https://picsum.photos/seed/book_thumb_$index/150/225',
        tags: ['Spirituality', 'Meditation', 'Santmat'],
        isFeatured: index < 3,
        isPopular: index % 2 == 0,
        isRecentlyAdded: index < 5,
        chapters: List.generate(
          5,
          (cIndex) => BookChapterEntity(
            id: 'c_${index}_$cIndex',
            title: 'Chapter ${cIndex + 1}',
            pageNumber: 1 + (cIndex * 20),
          ),
        ),
        pdfUrlPlaceholder:
            'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      );
    });
  }

  Future<List<BookEntity>> getLatestBooks() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _books.where((b) => b.isRecentlyAdded).toList();
  }

  Future<List<BookEntity>> getFeaturedBooks() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _books.where((b) => b.isFeatured).toList();
  }

  Future<List<BookEntity>> getPopularBooks() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _books.where((b) => b.isPopular).toList();
  }

  Future<BookEntity> getBookDetails(String id) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _books.firstWhere((b) => b.id == id);
  }

  Future<List<BookEntity>> searchBooks(String query) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final q = query.toLowerCase();
    return _books.where((b) {
      return b.title.toLowerCase().contains(q) ||
          b.author.name.toLowerCase().contains(q);
    }).toList();
  }

  Future<List<BookEntity>> filterBooks(BookFilterEntity filter) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _books.where((b) {
      if (filter.categoryId != null && b.category.id != filter.categoryId) {
        return false;
      }
      if (filter.authorId != null && b.author.id != filter.authorId) {
        return false;
      }
      if (filter.language != null && b.language != filter.language) {
        return false;
      }
      if (filter.isFeatured != null && b.isFeatured != filter.isFeatured) {
        return false;
      }
      if (filter.isPopular != null && b.isPopular != filter.isPopular) {
        return false;
      }
      if (filter.isRecentlyAdded != null &&
          b.isRecentlyAdded != filter.isRecentlyAdded) {
        return false;
      }
      return true;
    }).toList();
  }

  Future<List<BookCategoryEntity>> getCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _categories;
  }

  final List<BookBookmarkEntity> _bookmarks = [];
  final Map<String, ReadingProgressEntity> _readingHistory = {};

  Future<List<BookBookmarkEntity>> getBookmarks() async {
    await Future.delayed(const Duration(milliseconds: 400));
    if (_bookmarks.isEmpty && _books.isNotEmpty) {
      _bookmarks.add(
        BookBookmarkEntity(
          book: _books[0],
          pageNumber: 15,
          bookmarkedAt: DateTime.now(),
          note: 'Important concept',
        ),
      );
    }
    return _bookmarks;
  }

  Future<bool> toggleBookmark(String bookId, int pageNumber) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final existingIndex = _bookmarks.indexWhere(
      (b) => b.book.id == bookId && b.pageNumber == pageNumber,
    );
    if (existingIndex >= 0) {
      _bookmarks.removeAt(existingIndex);
      return false;
    } else {
      final book = _books.firstWhere((b) => b.id == bookId);
      _bookmarks.add(
        BookBookmarkEntity(
          book: book,
          pageNumber: pageNumber,
          bookmarkedAt: DateTime.now(),
        ),
      );
      return true;
    }
  }

  Future<List<ReadingProgressEntity>> getReadingHistory() async {
    await Future.delayed(const Duration(milliseconds: 400));
    if (_readingHistory.isEmpty && _books.isNotEmpty) {
      _readingHistory[_books[1].id] = ReadingProgressEntity(
        book: _books[1],
        lastReadPage: 45,
        percentage: 0.3,
        lastReadAt: DateTime.now().subtract(const Duration(days: 1)),
      );
    }
    final list = _readingHistory.values.toList();
    list.sort((a, b) => b.lastReadAt.compareTo(a.lastReadAt));
    return list;
  }

  Future<void> updateReadingProgress(
    String bookId,
    int pageNumber,
    double percentage,
  ) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final book = _books.firstWhere((b) => b.id == bookId);
    _readingHistory[bookId] = ReadingProgressEntity(
      book: book,
      lastReadPage: pageNumber,
      percentage: percentage,
      lastReadAt: DateTime.now(),
    );
  }
}
