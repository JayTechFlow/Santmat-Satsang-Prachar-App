enum MediaStatus {
  pending('pending'),
  processing('processing'),
  active('active'),
  archived('archived'),
  failed('failed'),
  deleted('deleted');

  const MediaStatus(this.value);
  final String value;

  static MediaStatus fromString(String value) {
    return MediaStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MediaStatus.pending,
    );
  }
}
