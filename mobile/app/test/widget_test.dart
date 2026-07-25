import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/app/app.dart';

void main() {
  testWidgets('App renders Santmat Satsang Prachar', (
    WidgetTester tester,
  ) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: App()));

    // Verify that our title is rendered.
    expect(find.text('Santmat Satsang Prachar'), findsOneWidget);
  });
}
