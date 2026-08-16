import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/storage/resolvers/media_url_resolver.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_analytics_service.dart';

class DownloadedMediaItem {
  final String id;
  final String title;
  final String localPath;
  final String mimeType;
  final int sizeBytes;
  final DateTime downloadedAt;
  final String? category;
  final String? mediaType;

  DownloadedMediaItem({
    required this.id,
    required this.title,
    required this.localPath,
    required this.mimeType,
    required this.sizeBytes,
    required this.downloadedAt,
    this.category,
    this.mediaType,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'localPath': localPath,
        'mimeType': mimeType,
        'sizeBytes': sizeBytes,
        'downloadedAt': downloadedAt.toIso8601String(),
        'category': category,
        'mediaType': mediaType,
      };

  factory DownloadedMediaItem.fromJson(Map<String, dynamic> json) =>
      DownloadedMediaItem(
        id: json['id'] as String,
        title: json['title'] as String? ?? 'Untitled',
        localPath: json['localPath'] as String,
        mimeType: json['mimeType'] as String? ?? '',
        sizeBytes: (json['sizeBytes'] as num?)?.toInt() ?? 0,
        downloadedAt: json['downloadedAt'] != null
            ? DateTime.parse(json['downloadedAt'] as String)
            : DateTime.now(),
        category: json['category'] as String?,
        mediaType: json['mediaType'] as String?,
      );
}

class OfflineMediaService extends ChangeNotifier {
  final MediaUrlResolver _urlResolver;
  final SharedPreferences _prefs;
  final PlaybackAnalyticsService? _analyticsService;

  static const String _registryKey = 'offline_downloads_registry';
  final Map<String, DownloadedMediaItem> _downloads = {};
  final Map<String, double> _downloadProgress = {};

  OfflineMediaService({
    required MediaUrlResolver urlResolver,
    required SharedPreferences prefs,
    PlaybackAnalyticsService? analyticsService,
  })  : _urlResolver = urlResolver,
        _prefs = prefs,
        _analyticsService = analyticsService {
    _loadRegistry();
  }

  void _loadRegistry() {
    final raw = _prefs.getString(_registryKey);
    if (raw != null && raw.isNotEmpty) {
      try {
        final Map<String, dynamic> decoded = jsonDecode(raw);
        decoded.forEach((key, value) {
          _downloads[key] =
              DownloadedMediaItem.fromJson(value as Map<String, dynamic>);
        });
      } catch (e) {
        debugPrint('Error loading offline media registry: $e');
      }
    }
  }

  Future<void> _saveRegistry() async {
    final jsonMap = _downloads.map((k, v) => MapEntry(k, v.toJson()));
    await _prefs.setString(_registryKey, jsonEncode(jsonMap));
    notifyListeners();
  }

  /// Returns current download progress (0.0 to 1.0) for a media asset ID.
  double? getProgress(String id) => _downloadProgress[id];

  /// Check whether media asset is downloaded and exists locally on disk.
  bool isDownloaded(String id) {
    final item = _downloads[id];
    if (item == null) return false;
    final file = File(item.localPath);
    if (!file.existsSync()) {
      _downloads.remove(id);
      _saveRegistry();
      return false;
    }
    return true;
  }

  /// Get local File for a downloaded media item if present and valid.
  File? getDownloadedFile(String id) {
    if (!isDownloaded(id)) return null;
    return File(_downloads[id]!.localPath);
  }

  /// Get list of all downloaded media items.
  List<DownloadedMediaItem> getDownloadedAssets() {
    return _downloads.values.where((item) => File(item.localPath).existsSync()).toList();
  }

  /// Download a MediaAsset for offline use.
  Future<File?> downloadMedia(
    MediaAsset asset, {
    void Function(double progress)? onProgress,
  }) async {
    if (isDownloaded(asset.id)) {
      return getDownloadedFile(asset.id);
    }

    try {
      _downloadProgress[asset.id] = 0.01;
      notifyListeners();

      final resolvedUrl = await _urlResolver.resolveDownloadUrl(
        asset.storageUrl.isNotEmpty ? asset.storageUrl : asset.storagePath,
      );

      final appDir = await getApplicationDocumentsDirectory();
      final offlineDir = Directory('${appDir.path}/offline_media');
      if (!offlineDir.existsSync()) {
        await offlineDir.create(recursive: true);
      }

      final ext = asset.metadata.extension.isNotEmpty
          ? asset.metadata.extension
          : (asset.storagePath.contains('.')
              ? asset.storagePath.split('.').last
              : 'dat');

      final destinationPath = '${offlineDir.path}/${asset.id}.$ext';
      final file = File(destinationPath);

      final request = await HttpClient().getUrl(Uri.parse(resolvedUrl));
      final response = await request.close();

      if (response.statusCode != 200) {
        throw Exception('Download failed with status code ${response.statusCode}');
      }

      final contentLength = response.contentLength;
      int downloadedBytes = 0;

      final sink = file.openWrite();
      await for (final chunk in response) {
        sink.add(chunk);
        downloadedBytes += chunk.length;
        if (contentLength > 0) {
          final progress = downloadedBytes / contentLength;
          _downloadProgress[asset.id] = progress;
          onProgress?.call(progress);
          notifyListeners();
        }
      }
      await sink.close();

      final item = DownloadedMediaItem(
        id: asset.id,
        title: asset.title ?? 'Audio/Video Asset',
        localPath: destinationPath,
        mimeType: asset.metadata.mimeType,
        sizeBytes: downloadedBytes,
        downloadedAt: DateTime.now(),
        category: asset.category.value,
        mediaType: asset.type.value,
      );

      _downloads[asset.id] = item;
      _downloadProgress.remove(asset.id);
      await _saveRegistry();

      await _analyticsService?.logMediaDownload(
        id: asset.id,
        title: asset.title ?? 'Asset',
        mediaType: asset.type.value,
      );

      return file;
    } catch (e) {
      _downloadProgress.remove(asset.id);
      notifyListeners();
      debugPrint('Failed to download media asset ${asset.id}: $e');
      rethrow;
    }
  }

  /// Delete a downloaded media file from device storage.
  Future<void> deleteDownloadedMedia(String id) async {
    final item = _downloads[id];
    if (item != null) {
      final file = File(item.localPath);
      if (file.existsSync()) {
        await file.delete();
      }
      _downloads.remove(id);
      await _saveRegistry();
    }
  }

  /// Clear all downloaded media files.
  Future<void> clearAllDownloads() async {
    for (final item in _downloads.values) {
      final file = File(item.localPath);
      if (file.existsSync()) {
        await file.delete();
      }
    }
    _downloads.clear();
    await _saveRegistry();
  }
}
