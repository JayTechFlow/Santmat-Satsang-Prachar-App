import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/phone_number_utils.dart';

void main() {
  group('PhoneNumberUtils — India-First Phone Number Normalization & Validation', () {
    test('1. Normalizes 10-digit raw input to E.164 (+91XXXXXXXXXX)', () {
      final input = '9876543210';
      final normalized = PhoneNumberUtils.normalizeToE164(input);
      expect(normalized, equals('+919876543210'));
    });

    test('2. Prevents duplicate +91 or leading 0/091 prefixes', () {
      expect(PhoneNumberUtils.normalizeToE164('+919876543210'), equals('+919876543210'));
      expect(PhoneNumberUtils.normalizeToE164('+91+919876543210'), equals('+919876543210'));
      expect(PhoneNumberUtils.normalizeToE164('09876543210'), equals('+919876543210'));
      expect(PhoneNumberUtils.normalizeToE164('00919876543210'), equals('+919876543210'));
    });

    test('3. Formats E.164 or raw number for UI display (+91 9876543210)', () {
      expect(PhoneNumberUtils.formatDisplay('9876543210'), equals('+91 9876543210'));
      expect(PhoneNumberUtils.formatDisplay('+919876543210'), equals('+91 9876543210'));
    });

    test('4. Extracts 10-digit local number from any formatted string', () {
      expect(PhoneNumberUtils.extract10Digits('+919876543210'), equals('9876543210'));
      expect(PhoneNumberUtils.extract10Digits('+91 9876543210'), equals('9876543210'));
      expect(PhoneNumberUtils.extract10Digits('09876543210'), equals('9876543210'));
    });

    test('5. Validates 10-digit Indian mobile number starting with 6, 7, 8, 9', () {
      expect(PhoneNumberUtils.validateIndianMobile('9876543210'), isNull);
      expect(PhoneNumberUtils.validateIndianMobile('8765432109'), isNull);
      expect(PhoneNumberUtils.validateIndianMobile('7654321098'), isNull);
      expect(PhoneNumberUtils.validateIndianMobile('6543210987'), isNull);
    });

    test('6. Rejects invalid length (short/long)', () {
      expect(PhoneNumberUtils.validateIndianMobile('12345'), equals('Enter a valid 10-digit mobile number'));
      expect(PhoneNumberUtils.validateIndianMobile('987654321'), equals('Enter a valid 10-digit mobile number'));
    });

    test('7. Rejects numbers starting with invalid digits (0-5)', () {
      expect(
        PhoneNumberUtils.validateIndianMobile('1234567890'),
        equals('Enter a valid Indian mobile number starting with 6, 7, 8, or 9'),
      );
      expect(
        PhoneNumberUtils.validateIndianMobile('5234567890'),
        equals('Enter a valid Indian mobile number starting with 6, 7, 8, or 9'),
      );
    });

    test('8. Rejects empty/whitespace input', () {
      expect(PhoneNumberUtils.validateIndianMobile(''), equals('Mobile number is required'));
      expect(PhoneNumberUtils.validateIndianMobile('   '), equals('Mobile number is required'));
    });
  });
}
