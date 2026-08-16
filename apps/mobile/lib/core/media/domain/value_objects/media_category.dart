enum MediaCategory {
  bhajan('bhajan'),
  stutiVinati('stuti_vinati'),
  book('book'),
  banner('banner'),
  avatar('avatar'),
  event('event'),
  notification('notification'),
  general('general');

  const MediaCategory(this.value);
  final String value;

  static MediaCategory fromString(String value) {
    return MediaCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MediaCategory.general,
    );
  }
}
