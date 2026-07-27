class Book {
  final String id;
  final String title;
  final String? author;
  final String? coverUrl;
  final String pdfUrl;
  final int? pages;
  final String? description;

  const Book({
    required this.id,
    required this.title,
    this.author,
    this.coverUrl,
    required this.pdfUrl,
    this.pages,
    this.description,
  });
}
