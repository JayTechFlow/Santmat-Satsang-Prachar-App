class DailyQuoteEntity {
  final String id;
  final String quoteText;
  final String author;
  final String? imageUrl;
  final DateTime date;

  const DailyQuoteEntity({
    required this.id,
    required this.quoteText,
    required this.author,
    this.imageUrl,
    required this.date,
  });
}
