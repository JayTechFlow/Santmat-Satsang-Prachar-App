class DailySuvichar {
  final String id;
  final String text;
  final String? imageUrl;
  final DateTime date;

  const DailySuvichar({
    required this.id,
    required this.text,
    this.imageUrl,
    required this.date,
  });
}
