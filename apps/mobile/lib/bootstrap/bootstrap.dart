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

Future<void> _activateAppCheck() async {
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
    developer.log('BOOTSTRAP: App Check activated');
  } catch (e) {
    developer.log('BOOTSTRAP WARNING: App Check activation failed: $e');
  }
}

Future<void> _initCrashlytics() async {
  if (!kDebugMode) {
    await CrashlyticsService().initialize();
  }
}

Future<void> _initStorageAndDi() async {
  await StorageService.init();
  await DependencyInjection.init();
}

Future<void> _initAudioBackground() async {
  try {
    await JustAudioBackground.init(
      androidNotificationChannelId: 'com.santmat.audio.channel.audio',
      androidNotificationChannelName: 'Audio playback',
      androidNotificationOngoing: true,
    );
  } catch (e) {
    developer.log('BOOTSTRAP WARNING: JustAudioBackground init error: $e');
  }
}

Future<void> bootstrap(Widget Function() builder) async {
  FlutterError.onError = GlobalErrorHandler.handleFlutterError;

  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      developer.log('BOOTSTRAP: 1. Initializing Firebase...');
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      developer.log('BOOTSTRAP: 2. Parallelizing independent initializations...');
      final results = await Future.wait([
        _activateAppCheck(),
        _initCrashlytics(),
        _initStorageAndDi(),
        _initAudioBackground(),
        SharedPreferences.getInstance(),
      ]);

      final prefs = results[4] as SharedPreferences;

      // Create the ProviderScope to get the container
      final container = ProviderContainer(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
          ...DependencyInjection.overrides,
        ],
      );

      developer.log('BOOTSTRAP: 3. Calling runApp...');
      runApp(UncontrolledProviderScope(container: container, child: builder()));
    },
    (error, stackTrace) {
      GlobalErrorHandler.handleAsyncError(error, stackTrace);
    },
  );
}
