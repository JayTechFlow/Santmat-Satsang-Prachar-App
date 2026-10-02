class StutiVinati {
  final String id;
  final String title;
  final String? subtitle;
  final String? artist;
  final String? duration;
  final String? bannerImage;
  final String? textContent;
  final String? audioUrl;
  final String type;
  final bool isFavorite;

  const StutiVinati({
    required this.id,
    required this.title,
    this.subtitle,
    this.artist,
    this.duration,
    this.bannerImage,
    this.textContent,
    this.audioUrl,
    required this.type,
    this.isFavorite = false,
  });

  StutiVinati copyWith({
    String? id,
    String? title,
    String? subtitle,
    String? artist,
    String? duration,
    String? bannerImage,
    String? textContent,
    String? audioUrl,
    String? type,
    bool? isFavorite,
  }) {
    return StutiVinati(
      id: id ?? this.id,
      title: title ?? this.title,
      subtitle: subtitle ?? this.subtitle,
      artist: artist ?? this.artist,
      duration: duration ?? this.duration,
      bannerImage: bannerImage ?? this.bannerImage,
      textContent: textContent ?? this.textContent,
      audioUrl: audioUrl ?? this.audioUrl,
      type: type ?? this.type,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }
}
