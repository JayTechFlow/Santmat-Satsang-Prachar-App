import 'user_statistics_entity.dart';
import 'user_preference_entity.dart';
import 'account_information_entity.dart';

class UserProfileEntity {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? photoUrl;
  final String? customPhotoUrl;
  final String? googlePhotoUrl;
  final UserStatisticsEntity statistics;
  final UserPreferenceEntity preferences;
  final AccountInformationEntity accountInfo;

  const UserProfileEntity({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.photoUrl,
    this.customPhotoUrl,
    this.googlePhotoUrl,
    required this.statistics,
    required this.preferences,
    required this.accountInfo,
  });

  /// Deterministic image resolution:
  /// 1. Custom uploaded profile image (highest priority)
  /// 2. Google account photoURL
  /// 3. Legacy / direct photoUrl
  /// 4. null -> triggers initials avatar or generic devotional icon
  String? get resolvedPhotoUrl {
    if (customPhotoUrl != null && customPhotoUrl!.trim().isNotEmpty) {
      return customPhotoUrl!.trim();
    }
    if (googlePhotoUrl != null && googlePhotoUrl!.trim().isNotEmpty) {
      return googlePhotoUrl!.trim();
    }
    if (photoUrl != null && photoUrl!.trim().isNotEmpty) {
      return photoUrl!.trim();
    }
    return null;
  }

  bool get hasCustomPhoto =>
      customPhotoUrl != null && customPhotoUrl!.trim().isNotEmpty;

  bool get hasGooglePhoto =>
      googlePhotoUrl != null && googlePhotoUrl!.trim().isNotEmpty;

  /// Deterministic fallback initial for avatars:
  /// Uses first character of name capitalized, or default Hindi 'सा' (साधक/सत्संग).
  String get initials {
    final clean = name.trim();
    if (clean.isEmpty) return 'सा';
    return clean[0].toUpperCase();
  }

  UserProfileEntity copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? photoUrl,
    String? customPhotoUrl,
    bool clearCustomPhotoUrl = false,
    String? googlePhotoUrl,
    UserStatisticsEntity? statistics,
    UserPreferenceEntity? preferences,
    AccountInformationEntity? accountInfo,
  }) {
    return UserProfileEntity(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      photoUrl: photoUrl ?? this.photoUrl,
      customPhotoUrl: clearCustomPhotoUrl ? null : (customPhotoUrl ?? this.customPhotoUrl),
      googlePhotoUrl: googlePhotoUrl ?? this.googlePhotoUrl,
      statistics: statistics ?? this.statistics,
      preferences: preferences ?? this.preferences,
      accountInfo: accountInfo ?? this.accountInfo,
    );
  }
}
