import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/book_entity.dart';
import '../../domain/entities/book_author_entity.dart';
import '../../domain/entities/book_category_entity.dart';
import '../../domain/entities/book_chapter_entity.dart';

class BookDto {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final BookAuthorEntity author;
  final BookCategoryEntity category;
  final String language;
  final String edition;
  final DateTime publicationDate;
  final int pageCount;
  final Duration estimatedReadingTime;
  final String coverImageUrl;
  final String thumbnailUrl;
  final List<String> tags;
  final bool isFeatured;
  final bool isPopular;
  final bool isRecentlyAdded;
  final List<BookChapterEntity> chapters;
  final String pdfUrlPlaceholder;

  BookDto({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.author,
    required this.category,
    required this.language,
    required this.edition,
    required this.publicationDate,
    required this.pageCount,
    required this.estimatedReadingTime,
    required this.coverImageUrl,
    required this.thumbnailUrl,
    required this.tags,
    required this.isFeatured,
    required this.isPopular,
    required this.isRecentlyAdded,
    required this.chapters,
    required this.pdfUrlPlaceholder,
  });

  factory BookDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    BookAuthorEntity author;
    final rawAuthor = data['author'];
    if (rawAuthor is Map) {
      final authorMap = Map<String, dynamic>.from(rawAuthor);
      author = BookAuthorEntity(
        id: authorMap['id'] as String? ?? '',
        name: authorMap['name'] as String? ?? '',
        bio: authorMap['bio'] as String? ?? '',
        imageUrl: authorMap['imageUrl'] as String? ?? '',
      );
    } else if (rawAuthor is String && rawAuthor.isNotEmpty) {
      author = BookAuthorEntity(
        id: '',
        name: rawAuthor,
        bio: '',
        imageUrl: '',
      );
    } else {
      author = const BookAuthorEntity(
        id: '',
        name: 'संतमत साहित्य',
        bio: '',
        imageUrl: '',
      );
    }

    BookCategoryEntity category;
    final rawCategory = data['category'];
    if (rawCategory is Map) {
      final categoryMap = Map<String, dynamic>.from(rawCategory);
      category = BookCategoryEntity(
        id: categoryMap['id'] as String? ?? '',
        name: categoryMap['name'] as String? ?? '',
        description: categoryMap['description'] as String? ?? '',
      );
    } else if (rawCategory is String && rawCategory.isNotEmpty) {
      category = BookCategoryEntity(
        id: '',
        name: rawCategory,
        description: '',
      );
    } else {
      category = const BookCategoryEntity(
        id: '',
        name: 'साहित्य',
        description: '',
      );
    }

    final chaptersList = data['chapters'] as List<dynamic>? ?? [];
    final chapters = chaptersList.map((c) {
      final cMap = c as Map<String, dynamic>;
      return BookChapterEntity(
        id: cMap['id'] as String? ?? '',
        title: cMap['title'] as String? ?? '',
        pageNumber: cMap['pageNumber'] as int? ?? 1,
      );
    }).toList();

    final coverImg = data['coverImageUrl'] as String? ??
        data['coverUrl'] as String? ??
        data['imageUrl'] as String? ??
        '';

    final pdfPath = data['pdfUrlPlaceholder'] as String? ??
        data['pdfUrl'] as String? ??
        data['storagePath'] as String? ??
        '';

    DateTime pubDate;
    final rawDate = data['publicationDate'] ?? data['publishDate'] ?? data['createdAt'];
    if (rawDate is Timestamp) {
      pubDate = rawDate.toDate();
    } else if (rawDate is String) {
      pubDate = DateTime.tryParse(rawDate) ?? DateTime.now();
    } else {
      pubDate = DateTime.now();
    }

    return BookDto(
      id: doc.id,
      title: data['title'] as String? ?? '',
      subtitle: data['subtitle'] as String? ?? '',
      description: data['description'] as String? ?? '',
      author: author,
      category: category,
      language: data['language'] as String? ?? 'hi',
      edition: data['edition'] as String? ?? '',
      publicationDate: pubDate,
      pageCount: data['pageCount'] as int? ?? data['pagesCount'] as int? ?? data['pages'] as int? ?? 0,
      estimatedReadingTime: Duration(
        minutes: data['estimatedReadingTimeMinutes'] as int? ?? 0,
      ),
      coverImageUrl: coverImg,
      thumbnailUrl: data['thumbnailUrl'] as String? ?? coverImg,
      tags: List<String>.from(data['tags'] ?? []),
      isFeatured: data['isFeatured'] as bool? ?? false,
      isPopular: data['isPopular'] as bool? ?? false,
      isRecentlyAdded: data['isRecentlyAdded'] as bool? ?? false,
      chapters: chapters,
      pdfUrlPlaceholder: pdfPath,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'subtitle': subtitle,
      'description': description,
      'author': {
        'id': author.id,
        'name': author.name,
        'bio': author.bio,
        'imageUrl': author.imageUrl,
      },
      'category': {
        'id': category.id,
        'name': category.name,
        'description': category.description,
      },
      'language': language,
      'edition': edition,
      'publicationDate': Timestamp.fromDate(publicationDate),
      'pageCount': pageCount,
      'estimatedReadingTimeMinutes': estimatedReadingTime.inMinutes,
      'coverImageUrl': coverImageUrl,
      'thumbnailUrl': thumbnailUrl,
      'tags': tags,
      'isFeatured': isFeatured,
      'isPopular': isPopular,
      'isRecentlyAdded': isRecentlyAdded,
      'chapters': chapters
          .map(
            (c) => {'id': c.id, 'title': c.title, 'pageNumber': c.pageNumber},
          )
          .toList(),
      'pdfUrlPlaceholder': pdfUrlPlaceholder,
    };
  }

  BookEntity toEntity() {
    return BookEntity(
      id: id,
      title: title,
      subtitle: subtitle,
      description: description,
      author: author,
      category: category,
      language: language,
      edition: edition,
      publicationDate: publicationDate,
      pageCount: pageCount,
      estimatedReadingTime: estimatedReadingTime,
      coverImageUrl: coverImageUrl,
      thumbnailUrl: thumbnailUrl,
      tags: tags,
      isFeatured: isFeatured,
      isPopular: isPopular,
      isRecentlyAdded: isRecentlyAdded,
      chapters: chapters,
      pdfUrlPlaceholder: pdfUrlPlaceholder,
    );
  }
}
