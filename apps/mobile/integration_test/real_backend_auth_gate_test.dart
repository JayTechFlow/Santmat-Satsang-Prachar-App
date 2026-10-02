import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:santmat_satsang_prachar/app/app.dart';
import 'package:santmat_satsang_prachar/core/di/dependency_injection.dart';
import 'package:santmat_satsang_prachar/core/storage/storage_service.dart';
import 'package:santmat_satsang_prachar/firebase_options.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/pages/home_page.dart';
import 'package:santmat_satsang_prachar/shared/widgets/primary_button.dart';

const String acceptanceEmail = 'acceptance.endtoend.2026@santmat.org';
const String acceptancePassword = 'Password123!';

Finder textFieldWithLabel(String label) => find.widgetWithText(TextFormField, label);

// Returns all visible text (for diagnostics on failure).
List<String> visibleTexts(WidgetTester tester) => find
    .byType(Text)
    .evaluate()
    .map((e) => (e.widget as Text).data)
    .whereType<String>()
    .where((t) => t.isNotEmpty)
    .toList();

Future<void> pumpUntil(
  WidgetTester tester,
  Finder finder, {
  Duration timeout = const Duration(seconds: 45),
}) async {
  final end = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(end)) {
    await tester.pump(const Duration(milliseconds: 250));
    if (finder.evaluate().isNotEmpty) return;
  }
  fail('Timed out waiting for $finder\nVisible texts: ${visibleTexts(tester)}');
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    await StorageService.init();
    await DependencyInjection.init();
  });

  testWidgets('REAL BACKEND: login gate, registration, role/status in users/{uid}, sign-in',
      (tester) async {
    final prefs = await SharedPreferences.getInstance();
    final container = ProviderContainer(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        ...DependencyInjection.overrides,
      ],
    );
    addTearDown(container.dispose);

    await tester.pumpWidget(
      UncontrolledProviderScope(container: container, child: const App()),
    );

    // FIRST GATE: fresh app must land on the Login page (no dead-end, no direct entry).
    await pumpUntil(tester, find.text('Login'));
    expect(find.text('Sign in with Email'), findsOneWidget);
    expect(find.text('Sign in with Google'), findsOneWidget);
    expect(find.text('Sign in with Phone'), findsOneWidget);
    expect(find.text("Don't have an account? Register"), findsOneWidget);

    // Navigate to Register and fill the form (app's normal flow).
    await tester.tap(find.text("Don't have an account? Register"));
    await pumpUntil(tester, find.widgetWithText(PrimaryButton, 'Create Account'));
    // Let the push transition settle so the login page beneath goes offstage
    // (otherwise its Email/Password fields collide with the register form).
    await tester.pump(const Duration(seconds: 1));

    await tester.enterText(textFieldWithLabel('Display Name'), 'संत साधक');
    await tester.enterText(textFieldWithLabel('Email'), acceptanceEmail);
    await tester.enterText(textFieldWithLabel('Password'), acceptancePassword);
    await tester.enterText(textFieldWithLabel('Confirm Password'), acceptancePassword);
    await tester.pump();

    await tester.tap(find.byType(PrimaryButton));

    // Wait for the network round trip (registration can be slow on first call).
    await tester.pump(const Duration(seconds: 5));
    final user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      // Diagnostics: registration failed — capture what the UI is showing.
      await tester.pump(const Duration(milliseconds: 500));
      debugPrint('REGISTRATION FAILED. Visible texts: ${visibleTexts(tester)}');
      // The app now correctly stays on the Register page (error recovery);
      // switch to login for the already-registered account. Wait for the
      // error SnackBar to auto-dismiss so it doesn't swallow the tap.
      await tester.pump(const Duration(seconds: 5));
      await tester.tap(find.text('Already have an account? Sign in'));
      await pumpUntil(tester, find.text('Sign in with Email'));
      await tester.pump(const Duration(seconds: 1));
      await tester.enterText(textFieldWithLabel('Email'), acceptanceEmail);
      await tester.enterText(textFieldWithLabel('Password'), acceptancePassword);
      await tester.pump();
      await tester.tap(find.text('Sign in with Email'));
    }

    // Authenticated home must appear.
    await pumpUntil(tester, find.byType(HomePage));
    expect(FirebaseAuth.instance.currentUser, isNotNull);

    // Canonical profile must exist at users/{uid} with mobile_user/active.
    final uid = FirebaseAuth.instance.currentUser!.uid;
    final doc = await FirebaseFirestore.instance.collection('users').doc(uid).get();
    expect(doc.exists, isTrue, reason: 'users/$uid must be created after registration');
    final data = doc.data()!;
    expect(data['role'], 'mobile_user');
    expect(data['status'], 'active');
    expect(data['accountStatus'], isNull,
        reason: 'accountStatus is a legacy field; canonical is status');
    expect(data['email'], acceptanceEmail);
    expect(data['uid'], uid);

    // Note: client-side list queries are intentionally denied by the rules;
    // admin-side reflection is verified separately via the admin web app.
  });
}