import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';
import 'core/di/dependency_injection.dart';
import 'core/logger/app_logger.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  await DependencyInjection.init();

  FlutterError.onError = (FlutterErrorDetails details) {
    appLogger.e(
      'FlutterError',
      error: details.exception,
      stackTrace: details.stack,
    );
    FlutterError.presentError(details);
  };

  runApp(
    ProviderScope(overrides: DependencyInjection.overrides, child: const App()),
  );
}
