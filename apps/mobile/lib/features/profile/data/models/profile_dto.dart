import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../../domain/entities/user_statistics_entity.dart';
import '../../domain/entities/account_information_entity.dart';

class ProfileDto {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? photoUrl;
  final String? customPhotoUrl;
  final String? googlePhotoUrl;
  final int downloadCount;
  final int favoriteCount;
  final int bookmarkCount;
  final int totalListeningTimeMinutes;
  final double readingProgressPercentage;
  final String languageCode;
  final String themeMode;
  final bool notificationsEnabled;
  final double devanagariFontScale;
  final String audioQuality;
  final DateTime memberSince;
  final String applicationVersion;

  ProfileDto({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.photoUrl,
    this.customPhotoUrl,
    this.googlePhotoUrl,
    required this.downloadCount,
    required this.favoriteCount,
    required this.bookmarkCount,
    required this.totalListeningTimeMinutes,
    required this.readingProgressPercentage,
    required this.languageCode,
    required this.themeMode,
    required this.notificationsEnabled,
    this.devanagariFontScale = 1.0,
    this.audioQuality = 'standard',
    required this.memberSince,
    required this.applicationVersion,
  });

  factory ProfileDto.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    final customPhoto = data['customPhotoUrl'] as String?;
    final googlePhoto = data['googlePhotoUrl'] as String?;
    final legacyPhoto = data['photoUrl'] as String? ?? data['photoURL'] as String?;

    return ProfileDto(
      id: doc.id,
      name: data['name'] as String? ?? data['displayName'] as String? ?? '',
      email: data['email'] as String?,
      phone: data['phone'] as String?,
      photoUrl: customPhoto ?? legacyPhoto ?? googlePhoto,
      customPhotoUrl: customPhoto,
      googlePhotoUrl: googlePhoto,
      downloadCount: data['downloadCount'] as int? ?? 0,
      favoriteCount: data['favoriteCount'] as int? ?? 0,
      bookmarkCount: data['bookmarkCount'] as int? ?? 0,
      totalListeningTimeMinutes: data['totalListeningTimeMinutes'] as int? ?? 0,
      readingProgressPercentage:
          (data['readingProgressPercentage'] as num?)?.toDouble() ?? 0.0,
      languageCode: data['languageCode'] as String? ?? 'hi',
      themeMode: data['themeMode'] as String? ?? 'system',
      notificationsEnabled: data['notificationsEnabled'] as bool? ?? true,
      devanagariFontScale: (data['devanagariFontScale'] as num?)?.toDouble() ?? 1.0,
      audioQuality: data['audioQuality'] as String? ?? 'standard',
      memberSince:
          (data['memberSince'] as Timestamp?)?.toDate() ??
          (data['createdAt'] as Timestamp?)?.toDate() ??
          DateTime.now(),
      applicationVersion: data['applicationVersion'] as String? ?? '1.0.0',
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'displayName': name,
      'email': email,
      'phone': phone,
      'photoUrl': photoUrl,
      'customPhotoUrl': customPhotoUrl,
      'googlePhotoUrl': googlePhotoUrl,
      'downloadCount': downloadCount,
      'favoriteCount': favoriteCount,
      'bookmarkCount': bookmarkCount,
      'totalListeningTimeMinutes': totalListeningTimeMinutes,
      'readingProgressPercentage': readingProgressPercentage,
      'languageCode': languageCode,
      'themeMode': themeMode,
      'notificationsEnabled': notificationsEnabled,
      'devanagariFontScale': devanagariFontScale,
      'audioQuality': audioQuality,
      'memberSince': Timestamp.fromDate(memberSince),
      'applicationVersion': applicationVersion,
    };
  }

  UserProfileEntity toEntity() {
    return UserProfileEntity(
      id: id,
      name: name,
      email: email,
      phone: phone,
      photoUrl: photoUrl,
      customPhotoUrl: customPhotoUrl,
      googlePhotoUrl: googlePhotoUrl,
      statistics: UserStatisticsEntity(
        downloadCount: downloadCount,
        favoriteCount: favoriteCount,
        bookmarkCount: bookmarkCount,
        totalListeningTime: Duration(minutes: totalListeningTimeMinutes),
        readingProgressPercentage: readingProgressPercentage,
      ),
      preferences: UserPreferenceEntity(
        languageCode: languageCode,
        themeMode: themeMode,
        notificationsEnabled: notificationsEnabled,
        devanagariFontScale: devanagariFontScale,
        audioQuality: audioQuality,
      ),
      accountInfo: AccountInformationEntity(
        memberSince: memberSince,
        applicationVersion: applicationVersion,
      ),
    );
  }
}
