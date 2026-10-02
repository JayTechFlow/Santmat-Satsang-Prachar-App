import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/presentation/pages/stuti_vinati_home_page.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/presentation/providers/stuti_vinati_providers.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/domain/entities/stuti_vinati_entity.dart';

void main() {
  testWidgets('Renders exactly 2 fixed Vinati tabs: morning and evening', (WidgetTester tester) async {
    final mockPrayers = [
      const StutiVinati(
        id: 'morning_stuti',
        title: 'प्रातःकालीन स्तुति पाठ',
        subtitle: 'प्रभात प्रार्थना',
        type: 'morning',
        audioUrl: 'https://example.com/morning.mp3',
      ),
      const StutiVinati(
        id: 'evening_stuti',
        title: 'संध्याकालीन आरती पाठ',
        subtitle: 'संध्या प्रार्थना',
        type: 'evening',
        audioUrl: 'https://example.com/evening.mp3',
      ),
      const StutiVinati(
        id: 'extra_stuti',
        title: 'अतिरिक्त पाठ',
        type: 'binti',
      ),
    ];

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          stutiVinatiListProvider.overrideWith((ref) => Stream.value(mockPrayers)),
        ],
        child: const MaterialApp(
          home: StutiVinatiHomePage(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('प्रातःकालीन स्तुति'), findsOneWidget);
    expect(find.text('संध्याकालीन स्तुति'), findsOneWidget);
    expect(find.text('बिनती'), findsNothing);
    expect(find.text('पद्य पाठ'), findsNothing);
  });
}
