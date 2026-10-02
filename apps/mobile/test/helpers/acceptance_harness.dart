import 'dart:async';

import 'package:flutter_riverpod/misc.dart' show Override;
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/core/config/app_config.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/services/firebase_analytics_service.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/session_model.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/entities/user_entity.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/repositories/auth_repository.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/datasources/notification_data_source.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_action_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_category_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_filter_entity.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/entities/notification_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/domain/entities/stuti_vinati_entity.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/presentation/providers/stuti_vinati_providers.dart';
import 'package:santmat_satsang_prachar/features/audio/presentation/providers/audio_providers.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_context.dart';

import 'mock_audio_data_source.dart';
import 'mock_book_data_source.dart';
import 'mock_daily_quote_data_source.dart';
import 'mock_donation_data_source.dart';
import 'mock_event_data_source.dart';
import 'mock_home_data_source.dart';
import 'mock_library_data_source.dart';
import 'mock_preference_data_source.dart';
import 'mock_profile_data_source.dart';
import 'mock_satsang_data_source.dart';
import 'mock_search_data_source.dart';

const String kNewUserPhone = '+919876543210';
const String kExistingUserPhone = '+919111111111';
const String kCorrectOtp = '123456';

/// Repository-level fake auth that mirrors the production repository
/// behavior, including phone sign-up, profile creation with role=mobile_user
/// for NEW users only, existing-user reuse, session restore and logout.
class FakeAuthRepository implements AuthRepository {
  final Map<String, Map<String, dynamic>> users;
  final StreamController<UserEntity?> _controller =
      StreamController<UserEntity?>.broadcast();

  UserEntity? _currentUser;
  @override
  UserEntity? get currentUser => _currentUser;
  set currentUser(UserEntity? user) {
    _currentUser = user;
    if (user != null && !users.containsKey(user.id)) {
      users[user.id] = {
        'uid': user.id,
        'displayName': user.displayName ?? 'Test User',
        'role': 'mobile_user',
        'accountStatus': 'active',
      };
    }
  }
  bool isFirstLaunch = false;
  bool _suspended = false;

  // Phone verification simulation
  final Set<String> _failedVerificationPhones = {};
  final Set<String> _expiredVerificationIds = {};
  final Set<String> _acceptedVerificationIds = {};
  String? _lastVerificationId;

  FakeAuthRepository({Map<String, Map<String, dynamic>>? users})
      : users = users ?? {};

  @override
  Stream<UserEntity?> get authStateChanges => _controller.stream;

  @override
  String? get currentUserId => currentUser?.id;

  void _emit() => _controller.add(currentUser);

  void failVerificationFor(String phone) => _failedVerificationPhones.add(phone);

  void expireLastVerification() {
    final vid = _lastVerificationId;
    if (vid != null) _expiredVerificationIds.add(vid);
  }

  @override
  Future<Result<SessionModel>> checkSession() async {
    if (_suspended) {
      return Result.success(SessionModel(isFirstLaunch: isFirstLaunch));
    }
    return Result.success(
      SessionModel(user: currentUser, isFirstLaunch: isFirstLaunch),
    );
  }

  @override
  Future<Result<void>> completeOnboarding() async {
    isFirstLaunch = false;
    return Result.success(null);
  }

  @override
  Future<Result<void>> verifyPhoneNumber({
    required String phoneNumber,
    required Function(String verificationId) codeSent,
    required Function(Exception error) verificationFailed,
  }) async {
    if (_failedVerificationPhones.contains(phoneNumber)) {
      verificationFailed(Exception('invalid-phone-number'));
      return Result.failure(Exception('invalid-phone-number'));
    }
    // Also simulate Firebase rejecting phones that don't exist.
    if (phoneNumber == '+99DISALLOWED') {
      verificationFailed(
        Exception('An internal error has occurred. [ INVALID_PHONE_NUMBER ]'),
      );
      return Result.failure(
        Exception('An internal error has occurred. [ INVALID_PHONE_NUMBER ]'),
      );
    }
    final vid = 'verification-id-${phoneNumber.hashCode}';
    _lastVerificationId = vid;
    _acceptedVerificationIds.add(vid);
    codeSent(vid);
    return Result.success(null);
  }

  @override
  Future<Result<UserEntity>> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async {
    if (smsCode != kCorrectOtp) {
      return Result.failure(
        Exception('The sms verification code used to create the phone auth '
            'credential is invalid. Please resend the verification code sms '
            'and be sure use the verification code provided by the user. '
            '[ invalid-verification-code ]'),
      );
    }
    if (_expiredVerificationIds.contains(verificationId)) {
      return Result.failure(
        Exception('The sms verification code used to create the phone auth '
            'credential has expired. [ invalid-verification-code ]'),
      );
    }
    final phone = _phoneForVerification(verificationId) ?? '+0000000000';
    final uid = 'phone_uid_$phone';
    currentUser = UserEntity(
      id: uid,
      displayName: 'User ($phone)',
      phoneNumber: phone,
      isAnonymous: false,
    );
    if (!users.containsKey(uid)) {
      users[uid] = {
        'uid': uid,
        'phone': phone,
        'displayName': 'User ($phone)',
        'name': 'User ($phone)',
        'role': 'mobile_user',
        'accountStatus': 'active',
      };
    }
    _emit();
    return Result.success(currentUser!);
  }

  String? _phoneForVerification(String verificationId) {
    for (final phone in [kNewUserPhone, kExistingUserPhone]) {
      if (verificationId == 'verification-id-${phone.hashCode}') {
        return phone;
      }
    }
    return null;
  }

  @override
  Future<Result<bool>> hasRegisteredProfile(String userId) async {
    return Result.success(users.containsKey(userId));
  }

  @override
  Future<Result<UserEntity>> registerWithPhone({
    required String name,
    String? email,
  }) async {
    final user = currentUser;
    if (user == null) {
      return Result.failure(
        Exception('No verified phone identity. OTP must be verified first.'),
      );
    }
    final uid = user.id;
    if (users.containsKey(uid)) {
      return Result.failure(
        Exception('This mobile number is already registered. Please sign in instead.'),
      );
    }
    users[uid] = {
      'uid': uid,
      'phone': user.phoneNumber ?? '',
      'name': name,
      'displayName': name,
      if (email != null && email.isNotEmpty) 'email': email,
      'role': 'mobile_user',
      'status': 'active',
    };
    return Result.success(user);
  }

  @override
  Future<Result<UserEntity?>> signInWithGoogle() async {
    const uid = 'google_uid_test';
    _currentUser = const UserEntity(
      id: uid,
      displayName: 'Google Test User',
      email: 'test@google.com',
      isAnonymous: false,
    );
    _emit();
    return Result.success(_currentUser);
  }

  @override
  Future<Result<UserEntity>> registerUserProfile({
    required String name,
    String? email,
  }) async {
    final user = currentUser;
    if (user == null) {
      return Result.failure(
        Exception('No authenticated Google user found. Please sign in first.'),
      );
    }
    final uid = user.id;
    users[uid] = {
      'uid': uid,
      'name': name,
      'displayName': name,
      if (email != null && email.isNotEmpty) 'email': email,
      'role': 'mobile_user',
      'status': 'active',
      'accountStatus': 'active',
    };
    return Result.success(user);
  }

  @override
  Future<Result<void>> signOut() async {
    currentUser = null;
    _emit();
    return Result.success(null);
  }

  void suspendUser() => _suspended = true;
}

/// Notification fixtures with a mix of read/unread rows and a bhajan-category
/// row used to drive the deep-link assertion.
class FakeNotificationDataSource implements NotificationDataSource {
  final List<NotificationEntity> _notifications = [
    NotificationEntity(
      id: 'notif_1',
      title: 'नया भजन जोड़ा गया',
      body: 'नए भजन का विवरण',
      category: const NotificationCategoryEntity(id: 'bhajan', name: 'भजन'),
      priority: 'high',
      timestamp: DateTime.now(),
      isRead: false,
      iconPlaceholder: 'icon',
      action: const NotificationActionEntity(
        type: 'navigate',
        route: '/audio',
        label: 'ऑडियो',
      ),
      deepLinkPlaceholder: '/audio',
      dismissible: true,
    ),
    NotificationEntity(
      id: 'notif_2',
      title: 'स्तुति अपडेट',
      body: 'स्तुति-बिनती अपडेट',
      category: const NotificationCategoryEntity(id: 'stuti', name: 'स्तुति'),
      priority: 'normal',
      timestamp: DateTime.now(),
      isRead: false,
      iconPlaceholder: 'icon',
      deepLinkPlaceholder: '/satsang',
      dismissible: true,
    ),
    NotificationEntity(
      id: 'notif_3',
      title: 'सूचना 3 (पढ़ी हुई)',
      body: 'पहले ही पढ़ी गई',
      category: const NotificationCategoryEntity(id: 'system', name: 'सिस्टम'),
      priority: 'normal',
      timestamp: DateTime.now(),
      isRead: true,
      iconPlaceholder: 'icon',
      dismissible: true,
    ),
  ];

  @override
  Future<List<NotificationEntity>> getNotifications(
    NotificationFilterEntity filter,
  ) async {
    return List.of(_notifications);
  }

  @override
  Future<int> getUnreadNotificationsCount() async {
    return _notifications.where((n) => !n.isRead).length;
  }

  @override
  Future<void> markNotificationAsRead(String id) async {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index >= 0) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
    }
  }

  @override
  Future<void> markAllNotificationsAsRead() async {
    for (var i = 0; i < _notifications.length; i++) {
      _notifications[i] = _notifications[i].copyWith(isRead: true);
    }
  }

  @override
  Future<void> deleteNotification(String id) async {
    _notifications.removeWhere((n) => n.id == id);
  }

  @override
  Future<void> clearNotifications() async {
    _notifications.clear();
  }

  @override
  Future<NotificationPreferenceEntity> getNotificationPreferences() async {
    return const NotificationPreferenceEntity(
      generalNotifications: true,
      satsangNotifications: true,
      audioNotifications: true,
      booksNotifications: true,
      dailyQuotes: true,
      events: true,
      donationUpdates: false,
      announcements: true,
      sound: true,
      vibration: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00',
    );
  }

  @override
  Future<void> updateNotificationPreferences(
    NotificationPreferenceEntity preferences,
  ) async {}
}

const morningStuti = StutiVinati(
  id: 'stuti_morning',
  title: 'प्रातःकालीन स्तुति',
  subtitle: 'सुबह की प्रार्थना',
  artist: 'संत समाज',
  audioUrl: 'https://test.com/morning.mp3',
  textContent: 'प्रातःकालीन स्तुति का पाठ',
  type: 'morning',
);

const eveningStuti = StutiVinati(
  id: 'stuti_evening',
  title: 'संध्याकालीन आरती',
  subtitle: 'शाम की आरती',
  artist: 'संत समाज',
  audioUrl: 'https://test.com/evening.mp3',
  textContent: 'संध्याकालीन आरती का पाठ',
  type: 'evening',
);

/// Full-provider override set for driving the real App() with in-memory fakes.
List<Override> acceptanceOverrides({
  required FakeAuthRepository auth,
  FakeNotificationDataSource? notifications,
}) {
  return [
    appConfigProvider.overrideWithValue(AppConfig.production()),
    permissionContextProvider.overrideWith(
      _FixedPermissionContextNotifier.new,
    ),
    authRepositoryProvider.overrideWithValue(auth),
    homeDataSourceProvider.overrideWithValue(MockHomeDataSource()),
    audioDataSourceProvider.overrideWithValue(MockAudioDataSource()),
    bookDataSourceProvider.overrideWithValue(MockBookDataSource()),
    dailyQuoteDataSourceProvider.overrideWithValue(MockDailyQuoteDataSource()),
    donationDataSourceProvider.overrideWithValue(MockDonationDataSource()),
    eventDataSourceProvider.overrideWithValue(MockEventDataSource()),
    libraryDataSourceProvider.overrideWithValue(MockLibraryDataSource()),
    notificationDataSourceProvider.overrideWithValue(
      notifications ?? FakeNotificationDataSource(),
    ),
    preferenceDataSourceProvider.overrideWithValue(
      MockPreferenceDataSource(),
    ),
    profileDataSourceProvider.overrideWithValue(MockProfileDataSource()),
    satsangDataSourceProvider.overrideWithValue(MockSatsangDataSource()),
    searchDataSourceProvider.overrideWithValue(MockSearchDataSource()),
    stutiVinatiListProvider.overrideWith(
      (ref) => Stream.value(const [morningStuti, eveningStuti]),
    ),
    audioPlayerProvider.overrideWithValue(null),
    firebaseAnalyticsServiceProvider.overrideWithValue(_NoopAnalyticsService()),
  ];
}

class _NoopAnalyticsService extends FirebaseAnalyticsService {
  @override
  Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {}

  @override
  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {}

  @override
  Future<void> setUserId(String? id) async {}

  @override
  Future<void> setUserProperty({
    required String name,
    required String? value,
  }) async {}
}

class _FixedPermissionContextNotifier extends PermissionContextNotifier {
  @override
  PermissionContext? build() {
    return createPermissionContext({'role': 'mobile_user'});
  }
}