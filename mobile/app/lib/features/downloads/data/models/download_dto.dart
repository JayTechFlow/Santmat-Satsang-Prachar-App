import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/download_entity.dart';
import '../../domain/entities/download_category_entity.dart';

class DownloadDto {
  static DownloadEntity fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    final categoryData = data['category'] as Map<String, dynamic>? ?? {};

    return DownloadEntity(
      id: doc.id,
      title: data['title'] as String? ?? '',
      contentType: data['contentType'] as String? ?? '',
      category: DownloadCategoryEntity(
        id: categoryData['id'] as String? ?? '',
        name: categoryData['name'] as String? ?? '',
      ),
      totalSize: data['totalSize'] as int? ?? 0,
      downloadedSize: data['downloadedSize'] as int? ?? 0,
      progress: (data['progress'] as num?)?.toDouble() ?? 0.0,
      status: data['status'] as String? ?? 'pending',
      priority: data['priority'] as int? ?? 1,
      createdDate:
          (data['createdDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      completedDate: (data['completedDate'] as Timestamp?)?.toDate(),
      localPathPlaceholder: data['localPathPlaceholder'] as String?,
      remoteUrlPlaceholder: data['remoteUrlPlaceholder'] as String? ?? '',
      thumbnail: data['thumbnail'] as String?,
    );
  }

  static Map<String, dynamic> toFirestore(DownloadEntity entity) {
    return {
      'title': entity.title,
      'contentType': entity.contentType,
      'category': {'id': entity.category.id, 'name': entity.category.name},
      'totalSize': entity.totalSize,
      'downloadedSize': entity.downloadedSize,
      'progress': entity.progress,
      'status': entity.status,
      'priority': entity.priority,
      'createdDate': Timestamp.fromDate(entity.createdDate),
      'completedDate': entity.completedDate != null
          ? Timestamp.fromDate(entity.completedDate!)
          : null,
      'localPathPlaceholder': entity.localPathPlaceholder,
      'remoteUrlPlaceholder': entity.remoteUrlPlaceholder,
      'thumbnail': entity.thumbnail,
    };
  }
}
