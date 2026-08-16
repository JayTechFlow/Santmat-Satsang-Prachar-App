class StutiVinati {
  final String id;
  final String title;
  final String? textContent;
  final String? audioUrl;
  final String type;

  const StutiVinati({
    required this.id,
    required this.title,
    this.textContent,
    this.audioUrl,
    required this.type,
  });
}
