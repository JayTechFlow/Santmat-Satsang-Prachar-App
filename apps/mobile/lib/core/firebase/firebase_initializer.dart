import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'firebase_options_provider.dart';

class FirebaseInitializer {
  static Future<void> initialize() async {
    await Firebase.initializeApp(
      options: FirebaseOptionsProvider.currentPlatform,
    );

    await FirebaseAppCheck.instance.activate(
      // ignore: deprecated_member_use
      androidProvider: kDebugMode ? AndroidProvider.debug : AndroidProvider.playIntegrity,
      // ignore: deprecated_member_use
      appleProvider: kDebugMode ? AppleProvider.debug : AppleProvider.deviceCheck,
      // ignore: deprecated_member_use
      webProvider: ReCaptchaV3Provider(const String.fromEnvironment('RECAPTCHA_SITE_KEY', defaultValue: 'recaptcha-v3-site-key')),
    );
  }
}
