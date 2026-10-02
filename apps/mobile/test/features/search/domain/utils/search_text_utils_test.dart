import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/features/search/domain/utils/search_text_utils.dart';

/// Group E — Unicode-safe Hindi matching primitives.
void main() {
  group('normalizeSearchText', () {
    test('lowercases, trims and collapses whitespace', () {
      expect(normalizeSearchText('  गुरु   ji  '), 'गुरु ji');
      expect(normalizeSearchText('Kabir   Satsang'), 'kabir satsang');
    });
  });

  group('normalizedContains', () {
    test('an empty query always matches', () {
      expect(normalizedContains('कुछ भी', ''), isTrue);
    });
  });

  group('normalizedContainsAll', () {
    test('matches Devanagari partial token across title+speaker', () {
      expect(
        normalizedContainsAll('प्रभु से प्रीत लगाई रे', 'गुरु'),
        isFalse,
      );
      expect(
        normalizedContainsAll('गुरु चरणन की सेवा', 'गुरु'),
        isTrue,
      );
      expect(
        normalizedContainsAll('गुरु चरणन की सेवा', 'गुरु सेवा'),
        isTrue,
      );
    });

    test('requires every token to be present', () {
      expect(
        normalizedContainsAll('गुरु चरणन की सेवा', 'गुरु कबीर'),
        isFalse,
      );
    });

    test('matches Latin case-insensitively', () {
      expect(normalizedContainsAll('Maharshi Mehi', 'maharshi'), isTrue);
    });

    test('is whitespace tolerant', () {
      expect(
        normalizedContainsAll('गुरु   चरणन की सेवा', '  गुरु  चरणन '),
        isTrue,
      );
    });
  });
}