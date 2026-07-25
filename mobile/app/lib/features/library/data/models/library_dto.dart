import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/bookmark_entity.dart';
import '../../domain/entities/favorite_entity.dart';
import '../../domain/entities/history_entity.dart';
import '../../domain/entities/recent_activity_entity.dart';
import '../../domain/entities/library_item_entity.dart';

class LibraryItemDto extends LibraryItemEntity {
  const LibraryItemDto({
    required super.id,
    required super.contentId,
    required super.contentType,
    required super.title,
    required super.subtitle,
    required super.thumbnail,
    required super.category,
    super.author,
    required super.createdDate,
    super.lastOpened,
    super.isFavorite = false,
    super.isBookmarked = false,
    super.progress,
    required super.sourceModule,
    required super.route,
  });

  factory LibraryItemDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return LibraryItemDto(
      id: doc.id,
      contentId: data['contentId'] ?? '',
      contentType: data['contentType'] ?? '',
      title: data['title'] ?? '',
      subtitle: data['subtitle'] ?? '',
      thumbnail: data['thumbnail'] ?? '',
      category: data['category'] ?? '',
      author: data['author'],
      createdDate: (data['createdDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      lastOpened: (data['lastOpened'] as Timestamp?)?.toDate(),
      isFavorite: data['isFavorite'] ?? false,
      isBookmarked: data['isBookmarked'] ?? false,
      progress: (data['progress'] as num?)?.toDouble(),
      sourceModule: data['sourceModule'] ?? '',
      route: data['route'] ?? '',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'contentId': contentId,
      'contentType': contentType,
      'title': title,
      'subtitle': subtitle,
      'thumbnail': thumbnail,
      'category': category,
      'author': author,
      'createdDate': Timestamp.fromDate(createdDate),
      'lastOpened': lastOpened != null ? Timestamp.fromDate(lastOpened!) : null,
      'isFavorite': isFavorite,
      'isBookmarked': isBookmarked,
      'progress': progress,
      'sourceModule': sourceModule,
      'route': route,
    };
  }
}

class BookmarkDto extends BookmarkEntity {
  const BookmarkDto({
    required super.id,
    required super.item,
    required super.bookmarkedDate,
  });

  factory BookmarkDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return BookmarkDto(
      id: doc.id,
      item: LibraryItemDto.fromFirestore(doc), // In a real app we might reference
      bookmarkedDate: (data['bookmarkedDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    final itemData = (item as LibraryItemDto).toFirestore();
    itemData['bookmarkedDate'] = Timestamp.fromDate(bookmarkedDate);
    return itemData;
  }
}

class FavoriteDto extends FavoriteEntity {
  const FavoriteDto({
    required super.id,
    required super.item,
    required super.favoritedDate,
  });

  factory FavoriteDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return FavoriteDto(
      id: doc.id,
      item: LibraryItemDto.fromFirestore(doc),
      favoritedDate: (data['favoritedDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    final itemData = (item as LibraryItemDto).toFirestore();
    itemData['favoritedDate'] = Timestamp.fromDate(favoritedDate);
    return itemData;
  }
}

class HistoryDto extends HistoryEntity {
  const HistoryDto({
    required super.id,
    required super.item,
    required super.accessedDate,
    super.sessionProgress,
  });

  factory HistoryDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return HistoryDto(
      id: doc.id,
      item: LibraryItemDto.fromFirestore(doc),
      accessedDate: (data['accessedDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      sessionProgress: (data['sessionProgress'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toFirestore() {
    final itemData = (item as LibraryItemDto).toFirestore();
    itemData['accessedDate'] = Timestamp.fromDate(accessedDate);
    itemData['sessionProgress'] = sessionProgress;
    return itemData;
  }
}

class RecentActivityDto extends RecentActivityEntity {
  const RecentActivityDto({
    required super.id,
    required super.item,
    required super.activityDate,
    required super.activityType,
  });

  factory RecentActivityDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    return RecentActivityDto(
      id: doc.id,
      item: LibraryItemDto.fromFirestore(doc),
      activityDate: (data['activityDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      activityType: data['activityType'] ?? '',
    );
  }

  Map<String, dynamic> toFirestore() {
    final itemData = (item as LibraryItemDto).toFirestore();
    itemData['activityDate'] = Timestamp.fromDate(activityDate);
    itemData['activityType'] = activityType;
    return itemData;
  }
}
