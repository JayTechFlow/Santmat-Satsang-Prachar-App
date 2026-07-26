class StorageMetadata {
  final String contentType;
  final int sizeBytes;
  final DateTime? timeCreated;
  final DateTime? updated;
  final Map<String, String> customMetadata;

  const StorageMetadata({
    this.contentType = 'application/octet-stream',
    this.sizeBytes = 0,
    this.timeCreated,
    this.updated,
    this.customMetadata = const {},
  });

  StorageMetadata copyWith({
    String? contentType,
    int? sizeBytes,
    DateTime? timeCreated,
    DateTime? updated,
    Map<String, String>? customMetadata,
  }) {
    return StorageMetadata(
      contentType: contentType ?? this.contentType,
      sizeBytes: sizeBytes ?? this.sizeBytes,
      timeCreated: timeCreated ?? this.timeCreated,
      updated: updated ?? this.updated,
      customMetadata: customMetadata ?? this.customMetadata,
    );
  }
}
