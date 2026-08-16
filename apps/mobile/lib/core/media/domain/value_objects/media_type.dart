// Enterprise Media Platform — MediaType Value Object
// Sprint M1 Foundation

enum MediaType {
  audio('audio'),
  image('image'),
  banner('banner'),
  pdf('pdf'),
  video('video'),
  document('document');

  const MediaType(this.value);
  final String value;

  static MediaType fromString(String value) {
    return MediaType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MediaType.document,
    );
  }
}
