import 'user_statistics_entity.dart';
import 'user_preference_entity.dart';
import 'account_information_entity.dart';

class UserProfileEntity {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? photoUrl;
  final UserStatisticsEntity statistics;
  final UserPreferenceEntity preferences;
  final AccountInformationEntity accountInfo;

  const UserProfileEntity({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.photoUrl,
    required this.statistics,
    required this.preferences,
    required this.accountInfo,
  });

  UserProfileEntity copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? photoUrl,
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
      statistics: statistics ?? this.statistics,
      preferences: preferences ?? this.preferences,
      accountInfo: accountInfo ?? this.accountInfo,
    );
  }
}
