// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get appTitle => 'संतमत सत्संग प्रचार';

  @override
  String get home => 'मुख्य पृष्ठ';

  @override
  String get retry => 'पुनः प्रयास करें';

  @override
  String get cancel => 'रद्द करें';

  @override
  String get confirm => 'पुष्टि करें';

  @override
  String get errorGeneric => 'कुछ गलत हो गया।';

  @override
  String get errorNetwork => 'कृपया अपने इंटरनेट कनेक्शन की जांच करें।';

  @override
  String get emptyStateTitle => 'अभी तक कुछ नहीं';

  @override
  String get emptyStateMessage => 'बाद में देखें।';

  @override
  String greeting(String name) {
    return 'जय गुरु, $name';
  }

  @override
  String get todaysQuote => 'आज का सुविचार';

  @override
  String get latestSatsang => 'नवीनतम सत्संग';

  @override
  String get upcomingEvents => 'आगामी कार्यक्रम';

  @override
  String get latestAudios => 'नवीनतम ऑडियो';

  @override
  String get featuredBooks => 'प्रमुख पुस्तकें';

  @override
  String get seeAll => 'सभी देखें';

  @override
  String get quickActions => 'त्वरित क्रियाएं';

  @override
  String get notifications => 'सूचनाएं';

  @override
  String get profile => 'प्रोफाइल';

  @override
  String get tabSatsang => 'सत्संग';

  @override
  String get tabAudio => 'ऑडियो';

  @override
  String get tabBooks => 'पुस्तकें';

  @override
  String get tabSettings => 'सेटिंग्स';

  @override
  String get statDownloads => 'डाउनलोड';

  @override
  String get statFavorites => 'पसंदीदा';

  @override
  String get statBookmarks => 'बुकमार्क';

  @override
  String memberSince(String date) {
    return '$date से सदस्य';
  }

  @override
  String appVersion(String version) {
    return 'संस्करण $version';
  }

  @override
  String get language => 'भाषा';

  @override
  String get themeLight => 'लाइट';

  @override
  String get themeDark => 'डार्क';

  @override
  String get themeSystem => 'सिस्टम डिफ़ॉल्ट';

  @override
  String get theme => 'थीम';

  @override
  String get logout => 'लॉग आउट';

  @override
  String get deleteAccount => 'खाता हटाएं';

  @override
  String get deleteAccountConfirmation =>
      'क्या आप वाकई अपना खाता हटाना चाहते हैं?';

  @override
  String get editProfile => 'प्रोफ़ाइल संपादित करें';

  @override
  String get accountSettings => 'खाता सेटिंग्स';

  @override
  String get save => 'सहेजें';

  @override
  String get name => 'नाम';

  @override
  String get phone => 'फ़ोन';

  @override
  String get email => 'ईमेल';

  @override
  String get privacyPolicy => 'गोपनीयता नीति';

  @override
  String get termsConditions => 'नियम एवं शर्तें';

  @override
  String get aboutApp => 'ऐप के बारे में';

  @override
  String get preferences => 'प्राथमिकताएं';

  @override
  String get satsang => 'सत्संग';

  @override
  String get categories => 'श्रेणियाँ';

  @override
  String get latestSatsangs => 'नवीनतम सत्संग';

  @override
  String get popularSatsangs => 'लोकप्रिय सत्संग';

  @override
  String get filters => 'फ़िल्टर';

  @override
  String get applyFilters => 'फ़िल्टर लागू करें';

  @override
  String get searchSatsangs => 'सत्संग खोजें...';

  @override
  String get description => 'विवरण';

  @override
  String get category => 'श्रेणी';

  @override
  String get duration => 'अवधि';

  @override
  String get audio => 'ऑडियो';

  @override
  String get recentlyPlayed => 'हाल ही में बजाया गया';

  @override
  String get featuredAudio => 'प्रमुख ऑडियो';

  @override
  String get popularAudio => 'लोकप्रिय ऑडियो';

  @override
  String get books => 'किताबें';

  @override
  String get dailyQuotes => 'दैनिक सुविचार';

  @override
  String get events => 'कार्यक्रम और आयोजन';

  @override
  String get donations => 'दान';
}
