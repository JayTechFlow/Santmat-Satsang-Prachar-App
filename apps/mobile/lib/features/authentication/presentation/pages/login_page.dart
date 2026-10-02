import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/app_scaffold.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../providers/auth_state_provider.dart';
import '../../domain/entities/session_model.dart';
import '../../../../core/utils/extensions/context_extension.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  bool _isSigningIn = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _isSigningIn = true);
    try {
      final notifier = ref.read(authStateProvider.notifier);
      final result = await notifier.signInWithGoogle();
      if (!mounted) return;
      setState(() => _isSigningIn = false);

      if (result.isNotRegistered) {
        debugPrint('[APP_AUTH] Google auth succeeded for new user. Navigating to registration profile completion.');
        context.go('/register');
      } else if (result.isSuccess) {
        debugPrint('[APP_AUTH] Google auth succeeded for existing user. Navigating to Home.');
      } else if (result.isFailure && result.error != null) {
        final errorMsg = result.error.toString().replaceAll('Exception: ', '');
        context.showSnackBar(errorMsg);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSigningIn = false);
      context.showSnackBar(e.toString().replaceAll('Exception: ', ''));
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isLoading = authState.isLoading || _isSigningIn;

    ref.listen<AsyncValue<SessionModel>>(authStateProvider, (previous, next) {
      if (next.hasError && !next.isLoading) {
        final errorMsg = next.error.toString().replaceAll('Exception: ', '');
        context.showSnackBar(errorMsg);
      }
    });

    return AppScaffold(
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.account_balance_outlined,
                      size: 72,
                      color: Colors.deepOrange,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Santmat Satsang Prachar',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Welcome back',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 48),
                    SizedBox(
                      width: double.infinity,
                      child: PrimaryButton(
                        text: 'Continue with Google',
                        isLoading: _isSigningIn,
                        onPressed: isLoading ? null : _signInWithGoogle,
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextButton(
                      onPressed: () => context.go('/register'),
                      child: const Text(
                        "First time here? Complete Profile",
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}