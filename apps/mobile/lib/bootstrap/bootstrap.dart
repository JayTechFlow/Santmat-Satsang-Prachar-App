import 'dart:async';
import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'package:just_audio_background/just_audio_background.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/di/dependency_injection.dart';
import '../core/error/global_error_handler.dart';
import '../core/storage/storage_service.dart';
import '../core/services/crashlytics_service.dart';
import '../firebase_options.dart';

Future<void> bootstrap(Widget Function() builder) async {
  FlutterError.onError = GlobalErrorHandler.handleFlutterError;

  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      developer.log('BOOTSTRAP: 1. Initializing Firebase...');
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      // Wave 5 — App Check activation (controlled rollout, Phase 9):
      //   DEBUG builds use the debug provider so local/emulator development
      //   keeps working without Play Integrity / DeviceCheck.
      //   RELEASE builds use the real attestation providers.
      // Activation failures must never block app startup; the backend
      // currently runs in audit mode and will only log missing tokens.
      try {
        await FirebaseAppCheck.instance.activate(
          // ignore: deprecated_member_use
          androidProvider: kDebugMode
              ? AndroidProvider.debug
              : AndroidProvider.playIntegrity,
          // ignore: deprecated_member_use
          appleProvider: kDebugMode
              ? AppleProvider.debug
              : AppleProvider.deviceCheck,
          providerWeb: kIsWeb
              ? ReCaptchaV3Provider(
                  const String.fromEnvironment(
                    'RECAPTCHA_SITE_KEY',
                    defaultValue: 'recaptcha-v3-site-key',
                  ),
                )
              : null,
        );
        developer.log('BOOTSTRAP: 1b. App Check activated');
      } catch (e) {
        developer.log('BOOTSTRAP WARNING: App Check activation failed: $e');
      }

      // Initialize Crashlytics for production error reporting
      if (!kDebugMode) {
        await CrashlyticsService().initialize();
      }

      developer.log('BOOTSTRAP: 2. Initializing Storage & DI...');
      await StorageService.init();
      await DependencyInjection.init();

      try {
        developer.log('BOOTSTRAP: 4. Initializing JustAudioBackground...');
        await JustAudioBackground.init(
          androidNotificationChannelId: 'com.santmat.audio.channel.audio',
          androidNotificationChannelName: 'Audio playback',
          androidNotificationOngoing: true,
        );
      } catch (e) {
        developer.log('BOOTSTRAP WARNING: JustAudioBackground init error: $e');
      }

      developer.log('BOOTSTRAP: 5. Loading SharedPreferences...');
      final prefs = await SharedPreferences.getInstance();

      // Create the ProviderScope to get the container
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          ...DependencyInjection.overrides,
        ],
      );

      developer.log('BOOTSTRAP: 6. Calling runApp...');
      runApp(UncontrolledProviderScope(container: container, child: builder()));
    },
    (error, stackTrace) {
      GlobalErrorHandler.handleAsyncError(error, stackTrace);
    },
  );
}
