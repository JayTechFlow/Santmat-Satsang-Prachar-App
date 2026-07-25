class DownloadPreferenceEntity {
  final String downloadQuality; // 'high', 'medium', 'low'
  final bool downloadOverWifiOnly;
  final String storagePreference; // 'internal', 'sd_card'
  final bool autoDeleteCompleted;

  const DownloadPreferenceEntity({
    required this.downloadQuality,
    required this.downloadOverWifiOnly,
    required this.storagePreference,
    required this.autoDeleteCompleted,
  });

  DownloadPreferenceEntity copyWith({
    String? downloadQuality,
    bool? downloadOverWifiOnly,
    String? storagePreference,
    bool? autoDeleteCompleted,
  }) {
    return DownloadPreferenceEntity(
      downloadQuality: downloadQuality ?? this.downloadQuality,
      downloadOverWifiOnly: downloadOverWifiOnly ?? this.downloadOverWifiOnly,
      storagePreference: storagePreference ?? this.storagePreference,
      autoDeleteCompleted: autoDeleteCompleted ?? this.autoDeleteCompleted,
    );
  }
}
