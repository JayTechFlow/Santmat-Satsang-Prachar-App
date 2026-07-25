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
  String get errorGeneric => 'Something went wrong.';

  @override
  String get errorNetwork => 'Please check your internet connection.';

  @override
  String get emptyStateTitle => 'Nothing Here Yet';

  @override
  String get emptyStateMessage => 'Check back later.';

  @override
  String greeting(String name) {
    return 'Jai Guru, $name';
  }

  @override
  String get todaysQuote => 'Today\'s Quote';

  @override
  String get latestSatsang => 'Latest Satsang';

  @override
  String get upcomingEvents => 'Upcoming Events';

  @override
  String get latestAudios => 'Latest Audios';

  @override
  String get featuredBooks => 'Featured Books';

  @override
  String get seeAll => 'See All';

  @override
  String get quickActions => 'Quick Actions';

  @override
  String get notifications => 'Notifications';

  @override
  String get profile => 'Profile';

  @override
  String get tabSatsang => 'Satsang';

  @override
  String get tabAudio => 'Audio';

  @override
  String get tabBooks => 'Books';

  @override
  String get tabSettings => 'Settings';

  @override
  String get statDownloads => 'Downloads';

  @override
  String get statFavorites => 'Favorites';

  @override
  String get statBookmarks => 'Bookmarks';

  @override
  String memberSince(String date) {
    return 'Member since $date';
  }

  @override
  String appVersion(String version) {
    return 'Version $version';
  }

  @override
  String get language => 'Language';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get themeSystem => 'System Default';

  @override
  String get theme => 'Theme';

  @override
  String get logout => 'Log Out';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get deleteAccountConfirmation =>
      'Are you sure you want to delete your account?';

  @override
  String get editProfile => 'Edit Profile';

  @override
  String get accountSettings => 'Account Settings';

  @override
  String get save => 'Save';

  @override
  String get name => 'Name';

  @override
  String get phone => 'Phone';

  @override
  String get email => 'Email';

  @override
  String get privacyPolicy => 'Privacy Policy';

  @override
  String get termsConditions => 'Terms & Conditions';

  @override
  String get aboutApp => 'About App';

  @override
  String get preferences => 'Preferences';

  @override
  String get satsang => 'Satsang';

  @override
  String get categories => 'Categories';

  @override
  String get latestSatsangs => 'Latest Satsangs';

  @override
  String get popularSatsangs => 'Popular Satsangs';

  @override
  String get filters => 'Filters';

  @override
  String get applyFilters => 'Apply Filters';

  @override
  String get searchSatsangs => 'Search satsangs...';

  @override
  String get description => 'Description';

  @override
  String get category => 'Category';

  @override
  String get duration => 'Duration';
}
