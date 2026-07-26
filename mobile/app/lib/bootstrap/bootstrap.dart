import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/di/dependency_injection.dart';
import '../core/error/global_error_handler.dart';
import '../core/storage/storage_service.dart';
import '../firebase_options.dart';

Future<void> bootstrap(Widget Function() builder) async {
  FlutterError.onError = GlobalErrorHandler.handleFlutterError;

  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();
      await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
      
      // Initialize Google Sign-In exactly once as required by google_sign_in v7.2.0
      await GoogleSignIn.instance.initialize(
        serverClientId: '488234518159-n8slcs9rk9759g69dq0av83gml8214jq.apps.googleusercontent.com',
      );

      // Initialize core services
      await StorageService.init();
      await DependencyInjection.init();

      final prefs = await SharedPreferences.getInstance();

      runApp(
        ProviderScope(
          overrides: [
            sharedPreferencesProvider.overrideWithValue(prefs),
            ...DependencyInjection.overrides,
          ],
          child: builder(),
        ),
      );
    },
    (error, stackTrace) {
      GlobalErrorHandler.handleAsyncError(error, stackTrace);
    },
  );
}
