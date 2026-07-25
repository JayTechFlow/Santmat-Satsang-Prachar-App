import 'package:firebase_analytics/firebase_analytics.dart';

class FirebaseAnalyticsService {
  final FirebaseAnalytics? _analyticsOverride;

  FirebaseAnalyticsService({FirebaseAnalytics? analytics}) 
      : _analyticsOverride = analytics;

  FirebaseAnalytics get _analytics => _analyticsOverride ?? FirebaseAnalytics.instance;

  Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {
    await _analytics.logEvent(name: name, parameters: parameters);
  }

  Future<void> logScreenView({required String screenName, String? screenClass}) async {
    await _analytics.logScreenView(screenName: screenName, screenClass: screenClass);
  }

  Future<void> setUserId(String? id) async {
    await _analytics.setUserId(id: id);
  }

  Future<void> setUserProperty({required String name, required String? value}) async {
    await _analytics.setUserProperty(name: name, value: value);
  }
}
