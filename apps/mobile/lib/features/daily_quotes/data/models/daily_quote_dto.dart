import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/daily_quote_entity.dart';
import '../../domain/entities/quote_category_entity.dart';
import '../../domain/entities/quote_author_entity.dart';

class QuoteDto {
  final String id;
  final String quoteText;
  final QuoteAuthorEntity author;
  final QuoteCategoryEntity category;
  final String language;
  final String reference;
  final List<String> tags;
  final DateTime createdDate;
  final bool isFeatured;
  final bool isDaily;
  final String backgroundImageUrl;
  final String gradientThemeId;

  QuoteDto({
    required this.id,
    required this.quoteText,
    required this.author,
    required this.category,
    required this.language,
    required this.reference,
    required this.tags,
    required this.createdDate,
    required this.isFeatured,
    required this.isDaily,
    required this.backgroundImageUrl,
    required this.gradientThemeId,
  });

  factory QuoteDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    QuoteAuthorEntity author;
    final rawAuthor = data['author'];
    if (rawAuthor is Map) {
      final authorMap = Map<String, dynamic>.from(rawAuthor);
      author = QuoteAuthorEntity(
        id: authorMap['id'] as String? ?? '',
        name: authorMap['name'] as String? ?? '',
        bio: authorMap['bio'] as String? ?? '',
        imageUrl: authorMap['imageUrl'] as String? ?? '',
      );
    } else if (rawAuthor is String && rawAuthor.isNotEmpty) {
      author = QuoteAuthorEntity(
        id: '',
        name: rawAuthor,
        bio: '',
        imageUrl: '',
      );
    } else {
      final titleStr = data['title'] as String? ?? '';
      author = QuoteAuthorEntity(
        id: '',
        name: titleStr.isNotEmpty ? titleStr : 'पूज्य गुरुदेव',
        bio: '',
        imageUrl: '',
      );
    }

    QuoteCategoryEntity category;
    final rawCategory = data['category'];
    if (rawCategory is Map) {
      final categoryMap = Map<String, dynamic>.from(rawCategory);
      category = QuoteCategoryEntity(
        id: categoryMap['id'] as String? ?? '',
        name: categoryMap['name'] as String? ?? '',
        description: categoryMap['description'] as String? ?? '',
      );
    } else if (rawCategory is String && rawCategory.isNotEmpty) {
      category = QuoteCategoryEntity(
        id: '',
        name: rawCategory,
        description: '',
      );
    } else {
      final themeStr = data['theme'] as String? ?? '';
      category = QuoteCategoryEntity(
        id: '',
        name: themeStr.isNotEmpty ? themeStr : 'सुविचार',
        description: '',
      );
    }

    final quoteText = data['quoteText'] as String? ??
        data['quote'] as String? ??
        data['content'] as String? ??
        '';

    final backgroundImageUrl = data['backgroundImageUrl'] as String? ??
        data['imageUrl'] as String? ??
        '';

    DateTime createdDate;
    final rawDate = data['createdDate'] ?? data['createdAt'] ?? data['syncedAt'] ?? data['updatedAt'];
    if (rawDate is Timestamp) {
      createdDate = rawDate.toDate();
    } else if (rawDate is String) {
      createdDate = DateTime.tryParse(rawDate) ?? DateTime.now();
    } else {
      createdDate = DateTime.now();
    }

    List<String> tagsList = [];
    if (data['tags'] is List) {
      tagsList = List<String>.from(data['tags']);
    } else if (data['tags'] is String) {
      tagsList = [data['tags'] as String];
    }

    return QuoteDto(
      id: doc.id,
      quoteText: quoteText,
      author: author,
      category: category,
      language: data['language'] as String? ?? 'Hindi',
      reference: data['reference'] as String? ?? '',
      tags: tagsList,
      createdDate: createdDate,
      isFeatured: data['isFeatured'] as bool? ?? data['isSpecialPoster'] as bool? ?? true,
      isDaily: data['isDaily'] as bool? ?? true,
      backgroundImageUrl: backgroundImageUrl,
      gradientThemeId: data['gradientThemeId'] as String? ?? '',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'quoteText': quoteText,
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
      'reference': reference,
      'tags': tags,
      'createdDate': Timestamp.fromDate(createdDate),
      'isFeatured': isFeatured,
      'isDaily': isDaily,
      'backgroundImageUrl': backgroundImageUrl,
      'gradientThemeId': gradientThemeId,
    };
  }

  DailyQuoteEntity toEntity({bool isFavorite = false}) {
    return DailyQuoteEntity(
      id: id,
      quoteText: quoteText,
      author: author,
      category: category,
      language: language,
      reference: reference,
      tags: tags,
      createdDate: createdDate,
      isFeatured: isFeatured,
      isFavorite: isFavorite, // Resolved from local DB or context usually
      isDaily: isDaily,
      backgroundImageUrl: backgroundImageUrl,
      gradientThemeId: gradientThemeId,
    );
  }
}
