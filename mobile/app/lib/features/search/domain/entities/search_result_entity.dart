enum SearchContentType { satsang, audio, books, dailyQuotes, events, videos, downloads, gallery, unknown }

class SearchResultEntity {
  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final SearchContentType type;
  final String routePath;
  final DateTime date;
  final List<String> tags;

  const SearchResultEntity({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.type,
    required this.routePath,
    required this.date,
    required this.tags,
  });
}
