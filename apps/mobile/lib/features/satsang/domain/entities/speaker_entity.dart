class SpeakerEntity {
  final String id;
  final String name;
  final String? photoUrl;
  final String? bio;

  const SpeakerEntity({
    required this.id,
    required this.name,
    this.photoUrl,
    this.bio,
  });
}
