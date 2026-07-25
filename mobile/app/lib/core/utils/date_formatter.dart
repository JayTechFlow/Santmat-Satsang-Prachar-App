import 'package:intl/intl.dart';

class DateFormatter {
  const DateFormatter._();

  static String format(DateTime date, {String pattern = 'dd MMM yyyy'}) {
    return DateFormat(pattern).format(date);
  }

  static String formatTime(DateTime date) {
    return DateFormat.jm().format(date);
  }
}
