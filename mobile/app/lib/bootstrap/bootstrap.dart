import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/di/dependency_injection.dart';
import '../core/error/global_error_handler.dart';
import '../core/storage/storage_service.dart';

Future<void> bootstrap(Widget Function() builder) async {
  FlutterError.onError = GlobalErrorHandler.handleFlutterError;

  await runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      // Initialize core services
      await StorageService.init();
      await DependencyInjection.init();

      runApp(
        ProviderScope(
          overrides: DependencyInjection.overrides,
          child: builder(),
        ),
      );
    },
    (error, stackTrace) {
      GlobalErrorHandler.handleAsyncError(error, stackTrace);
    },
  );
}
