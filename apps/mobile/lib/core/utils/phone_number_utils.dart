/// Centralized utility class for Indian phone number normalization, display formatting,
/// 10-digit extraction, and validation.
///
/// India-First standard:
/// Input: 10-digit Indian mobile number (e.g. 9876543210)
/// Firebase / Auth / Firestore E.164: +919876543210
/// Display: +91 9876543210
class PhoneNumberUtils {
  const PhoneNumberUtils._();

  /// Extracts the 10-digit local Indian mobile number from any input string.
  /// Handles country code prefixes like +91, 91, or leading 0 cleanly.
  static String extract10Digits(String input) {
    String digits = input.replaceAll(RegExp(r'\D'), '');
    if (digits.length == 12 && digits.startsWith('91')) {
      return digits.substring(2);
    }
    if (digits.length == 11 && digits.startsWith('0')) {
      return digits.substring(1);
    }
    return digits;
  }

  /// Normalizes a 10-digit mobile number or raw input string to E.164 format (+91XXXXXXXXXX).
  static String normalizeToE164(String input) {
    final tenDigits = extract10Digits(input);
    if (tenDigits.length > 10) {
      return '+91${tenDigits.substring(tenDigits.length - 10)}';
    }
    return '+91$tenDigits';
  }

  /// Formats an E.164 or 10-digit number for clean UI display (+91 9876543210).
  static String formatDisplay(String input) {
    if (input.trim().isEmpty) return '';
    final tenDigits = extract10Digits(input);
    if (tenDigits.length == 10) {
      return '+91 $tenDigits';
    }
    final normalized = normalizeToE164(input);
    if (normalized.startsWith('+91') && normalized.length == 13) {
      return '+91 ${normalized.substring(3)}';
    }
    return normalized;
  }

  /// Validates a 10-digit Indian mobile number.
  /// Indian mobile numbers must be exactly 10 digits starting with 6, 7, 8, or 9.
  static String? validateIndianMobile(String? value) {
    final raw = value?.trim() ?? '';
    if (raw.isEmpty) {
      return 'Mobile number is required';
    }

    final tenDigits = extract10Digits(raw);
    if (tenDigits.length != 10) {
      return 'Enter a valid 10-digit mobile number';
    }

    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(tenDigits)) {
      return 'Enter a valid Indian mobile number starting with 6, 7, 8, or 9';
    }

    return null;
  }
}
