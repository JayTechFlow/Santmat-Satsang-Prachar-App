import 'package:flutter/foundation.dart';
import '../logger/app_logger.dart';

class GlobalErrorHandler {
  const GlobalErrorHandler._();

  static void handleFlutterError(FlutterErrorDetails details) {
    appLogger.e(
      'FlutterError',
      error: details.exception,
      stackTrace: details.stack,
    );
    FlutterError.presentError(details);
  }

  static void handleAsyncError(Object error, StackTrace stackTrace) {
    appLogger.e('AsyncError', error: error, stackTrace: stackTrace);
  }
}
