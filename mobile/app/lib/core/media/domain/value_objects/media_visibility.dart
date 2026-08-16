enum MediaVisibility {
  public('public'),
  authenticated('authenticated'),
  adminOnly('admin_only');

  const MediaVisibility(this.value);
  final String value;

  static MediaVisibility fromString(String value) {
    return MediaVisibility.values.firstWhere(
      (e) => e.value == value,
      orElse: () => MediaVisibility.authenticated,
    );
  }
}
