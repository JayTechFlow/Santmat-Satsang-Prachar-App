import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'firebase_options_provider.dart';

class FirebaseInitializer {
  static Future<void> initialize() async {
    await Firebase.initializeApp(
      options: FirebaseOptionsProvider.currentPlatform,
    );
    
    await FirebaseAppCheck.instance.activate(
      providerAndroid: AndroidAppCheckProvider.debug,
      providerApple: AppleAppCheckProvider.debug,
      providerWeb: ReCaptchaV3Provider('recaptcha-v3-site-key'),
    );
  }
}
