import '../../domain/entities/books_entity.dart';

class BookDto extends Book {
  const BookDto({
    required super.id,
    required super.title,
    super.author,
    super.coverUrl,
    required super.pdfUrl,
    super.pages,
    super.description,
  });

  factory BookDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return BookDto(
      id: id ?? json['id'] as String? ?? '',
      title: json['title'] as String,
      author: json['author'] as String?,
      coverUrl: json['coverUrl'] as String?,
      pdfUrl: json['pdfUrl'] as String,
      pages: json['pages'] as int?,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'author': author,
      'coverUrl': coverUrl,
      'pdfUrl': pdfUrl,
      'pages': pages,
      'description': description,
    };
  }
}
