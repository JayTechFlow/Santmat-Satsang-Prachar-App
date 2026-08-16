extension StringExtension on String {
  bool get isNullOrEmpty => trim().isEmpty;
  bool get isNotNullOrEmpty => !isNullOrEmpty;

  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}

extension NullableStringExtension on String? {
  bool get isNullOrEmpty => this == null || this!.trim().isEmpty;
  bool get isNotNullOrEmpty => !isNullOrEmpty;
}
