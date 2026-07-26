import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../../../core/services/firestore_service.dart';
import '../../domain/entities/download_entity.dart';
import '../../domain/entities/download_filter_entity.dart';
import '../../domain/entities/offline_content_entity.dart';
import '../../domain/entities/storage_statistics_entity.dart';
import '../../domain/entities/download_category_entity.dart';
import '../models/download_dto.dart';
import 'download_data_source.dart';

class FirestoreDownloadDataSource implements DownloadDataSource {
  final FirestoreService _firestoreService;

  FirestoreDownloadDataSource(this._firestoreService);

  @override
  Future<List<DownloadEntity>> getDownloads(DownloadFilterEntity filter) async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.downloads,
    );
    var results = snapshot.docs
        .map((doc) => DownloadDto.fromFirestore(doc))
        .toList();

    if (filter.status != null) {
      results = results.where((d) => d.status == filter.status).toList();
    }
    if (filter.contentType != null) {
      results = results
          .where((d) => d.contentType == filter.contentType)
          .toList();
    }
    if (filter.categoryId != null) {
      results = results
          .where((d) => d.category.id == filter.categoryId)
          .toList();
    }
    if (filter.searchQuery != null && filter.searchQuery!.isNotEmpty) {
      results = results
          .where(
            (d) => d.title.toLowerCase().contains(
              filter.searchQuery!.toLowerCase(),
            ),
          )
          .toList();
    }

    if (filter.sort != null) {
      switch (filter.sort) {
        case 'newest':
          results.sort((a, b) => b.createdDate.compareTo(a.createdDate));
          break;
        case 'oldest':
          results.sort((a, b) => a.createdDate.compareTo(b.createdDate));
          break;
        case 'largest':
          results.sort((a, b) => b.totalSize.compareTo(a.totalSize));
          break;
        case 'smallest':
          results.sort((a, b) => a.totalSize.compareTo(b.totalSize));
          break;
      }
    } else {
      results.sort((a, b) => b.createdDate.compareTo(a.createdDate));
    }

    return results;
  }

  @override
  Future<void> startDownload(
    String remoteUrl,
    String title,
    String contentType,
    String categoryId,
    String? thumbnail,
  ) async {
    final newDownload = DownloadEntity(
      id: '', // Will be assigned by Firestore
      title: title,
      contentType: contentType,
      category: DownloadCategoryEntity(id: categoryId, name: 'Category'),
      totalSize: 50 * 1024 * 1024,
      downloadedSize: 0,
      progress: 0.0,
      status: 'downloading',
      priority: 1,
      createdDate: DateTime.now(),
      remoteUrlPlaceholder: remoteUrl,
      thumbnail: thumbnail,
    );
    await _firestoreService.addDocument(
      FirestoreCollections.downloads,
      DownloadDto.toFirestore(newDownload),
    );
  }

  @override
  Future<void> pauseDownload(String downloadId) async {
    await _firestoreService.updateDocument(
      FirestoreCollections.downloads,
      downloadId,
      {'status': 'paused'},
    );
  }

  @override
  Future<void> resumeDownload(String downloadId) async {
    await _firestoreService.updateDocument(
      FirestoreCollections.downloads,
      downloadId,
      {'status': 'downloading'},
    );
  }

  @override
  Future<void> cancelDownload(String downloadId) async {
    await _firestoreService.deleteDocument(
      FirestoreCollections.downloads,
      downloadId,
    );
  }

  @override
  Future<void> deleteDownload(String downloadId) async {
    await _firestoreService.deleteDocument(
      FirestoreCollections.downloads,
      downloadId,
    );
  }

  @override
  Future<void> retryDownload(String downloadId) async {
    await resumeDownload(downloadId);
  }

  @override
  Future<void> clearDownloads() async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.downloads,
    );
    final batch = FirebaseFirestore.instance.batch();
    for (var doc in snapshot.docs) {
      batch.delete(doc.reference);
    }
    await batch.commit();
  }

  @override
  Future<List<OfflineContentEntity>> getOfflineContent() async {
    final snapshot = await _firestoreService.getCollection(
      FirestoreCollections.downloads,
    );
    final downloads = snapshot.docs
        .map((doc) => DownloadDto.fromFirestore(doc))
        .where((d) => d.isCompleted)
        .toList();

    return downloads.map((d) {
      return OfflineContentEntity(
        id: 'off_${d.id}',
        download: d,
        localFilePath:
            d.localPathPlaceholder ?? '/storage/emulated/0/Download/${d.title}',
        lastAccessed: DateTime.now(),
      );
    }).toList();
  }

  @override
  Future<StorageStatisticsEntity> getStorageStatistics() async {
    // In a real app this would query the local file system.
    return const StorageStatisticsEntity(
      totalSpace: 64 * 1024 * 1024 * 1024,
      freeSpace: 24 * 1024 * 1024 * 1024,
      appUsage: 500 * 1024 * 1024,
      downloadsUsage: 1024 * 1024 * 1024,
      cacheUsage: 200 * 1024 * 1024,
      usageByContentType: {
        'audio': 500 * 1024 * 1024,
        'book': 300 * 1024 * 1024,
        'document': 224 * 1024 * 1024,
      },
    );
  }
}
