// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Santmat Satsang Prachar';

  @override
  String get home => 'Home';

  @override
  String get retry => 'Retry';

  @override
  String get cancel => 'Cancel';

  @override
  String get confirm => 'Confirm';

  @override
  String get errorGeneric => 'An unexpected error occurred.';

  @override
  String get errorNetwork => 'Please check your internet connection.';

  @override
  String get emptyStateTitle => 'Nothing here yet';

  @override
  String get emptyStateMessage => 'Check back later for updates.';
}
