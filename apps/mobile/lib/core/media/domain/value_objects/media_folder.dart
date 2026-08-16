enum MediaFolder {
  audio('audio'),
  books('books'),
  banners('banners'),
  images('images'),
  videos('videos'),
  avatars('avatars'),
  documents('documents'),
  events('events'),
  exports('exports'),
  temp('temp'),
  processing('processing'),
  backups('backups');

  const MediaFolder(this.value);
  final String value;

  static MediaFolder fromString(String value) {
    return MediaFolder.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MediaFolder.temp,
    );
  }
}
