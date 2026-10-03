import 'package:firebase_analytics/firebase_analytics.dart';

class FirebaseAnalyticsService {
  final FirebaseAnalytics? _analyticsOverride;

  FirebaseAnalyticsService({FirebaseAnalytics? analytics})
    : _analyticsOverride = analytics;

  FirebaseAnalytics? get _analytics {
    if (_analyticsOverride != null) return _analyticsOverride;
    try {
      return FirebaseAnalytics.instance;
    } catch (_) {
      return null;
    }
  }

  Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {
    try {
      await _analytics?.logEvent(name: name, parameters: parameters);
    } catch (_) {}
  }

  Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    try {
      await _analytics?.logScreenView(
        screenName: screenName,
        screenClass: screenClass,
      );
    } catch (_) {}
  }

  Future<void> setUserId(String? id) async {
    try {
      await _analytics?.setUserId(id: id);
    } catch (_) {}
  }

  Future<void> setUserProperty({
    required String name,
    required String? value,
  }) async {
    try {
      await _analytics?.setUserProperty(name: name, value: value);
    } catch (_) {}
  }
}
