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
  String get errorGeneric => 'एक अप्रत्याशित त्रुटि हुई।';

  @override
  String get errorNetwork => 'कृपया अपने इंटरनेट कनेक्शन की जांच करें।';

  @override
  String get emptyStateTitle => 'अभी यहाँ कुछ नहीं है';

  @override
  String get emptyStateMessage => 'अपडेट के लिए बाद में वापस आएं।';
}
