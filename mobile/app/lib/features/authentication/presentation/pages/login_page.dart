import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/widgets/app_scaffold.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../../shared/widgets/secondary_button.dart';
import '../providers/auth_state_provider.dart';
import '../../../../core/utils/extensions/context_extension.dart';
import 'dart:developer' as developer;

class LoginPage extends ConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final isLoading = authState.isLoading;

    ref.listen(authStateProvider, (previous, next) {
      if (next.hasError) {
        context.showSnackBar(next.error.toString());
      }
    });

    return AppScaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Login',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Sign in with Google',
                isLoading: isLoading,
                onPressed: () {
                  developer.log('1. Login button pressed (Google)');
                  ref.read(authStateProvider.notifier).signInWithGoogle();
                },
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: SecondaryButton(
                text: 'Continue as Guest',
                isLoading: isLoading,
                onPressed: () {
                  developer.log('1. Login button pressed (Guest)');
                  ref.read(authStateProvider.notifier).signInAnonymously();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
