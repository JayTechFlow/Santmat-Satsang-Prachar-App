import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/di/data_providers.dart';
import '../../../../shared/widgets/app_scaffold.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../domain/entities/user_entity.dart';
import '../providers/auth_state_provider.dart';
import '../../domain/entities/session_model.dart';
import '../../../../core/utils/extensions/context_extension.dart';
import '../../../../core/utils/validators.dart';

class RegistrationPage extends ConsumerStatefulWidget {
  final String? initialPhone;
  const RegistrationPage({super.key, this.initialPhone});

  @override
  ConsumerState<RegistrationPage> createState() => _RegistrationPageState();
}

class _RegistrationPageState extends ConsumerState<RegistrationPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();

  bool _isCreating = false;
  AuthStateNotifier? _authNotifier;

  @override
  void initState() {
    super.initState();
    _authNotifier = ref.read(authStateProvider.notifier);
    _authNotifier?.beginRegistration();

    // Pre-fill profile details from current user if available
    UserEntity? currentUser;
    try {
      currentUser = ref.read(authRepositoryProvider).currentUser;
    } catch (_) {
      currentUser = ref.read(authStateProvider).value?.user;
    }
    if (currentUser != null) {
      if (currentUser.displayName != null && currentUser.displayName!.isNotEmpty) {
        _nameController.text = currentUser.displayName!;
      }
      if (currentUser.email != null && currentUser.email!.isNotEmpty) {
        _emailController.text = currentUser.email!;
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _authNotifier?.endRegistration();
    super.dispose();
  }

  Future<void> _completeProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isCreating = true);
    final notifier = ref.read(authStateProvider.notifier);
    UserEntity? currentUser;
    try {
      currentUser = ref.read(authRepositoryProvider).currentUser;
    } catch (_) {
      currentUser = ref.read(authStateProvider).value?.user;
    }

    if (currentUser == null) {
      // User is not signed in with Google yet — launch Google sign in first
      debugPrint('[APP_AUTH] Registration: No Firebase user active, initiating Google Sign-In.');
      final result = await notifier.signInWithGoogle();
      if (!mounted) return;
      if (!result.isNotRegistered && !result.isSuccess) {
        setState(() => _isCreating = false);
        if (result.isFailure && result.error != null) {
          context.showSnackBar(result.error.toString().replaceAll('Exception: ', ''));
        }
        return;
      }
    }

    final email = _emailController.text.trim();
    final name = _nameController.text.trim();
    debugPrint('[APP_AUTH] _completeProfile starting for $name ($email)');

    await notifier.registerUserProfile(
      name: name,
      email: email.isEmpty ? null : email,
    );

    if (!mounted) return;
    setState(() => _isCreating = false);
    debugPrint('[APP_AUTH] registerUserProfile completed.');
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isLoading = authState.isLoading || _isCreating;

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
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.person_add_alt_1_outlined,
                        size: 64,
                        color: Colors.deepOrange,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Complete Profile',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Welcome to Santmat Satsang Prachar. Confirm your profile details to continue.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 15, color: Colors.grey),
                      ),
                      const SizedBox(height: 32),
                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Full Name',
                          prefixIcon: Icon(Icons.person),
                        ),
                        textInputAction: TextInputAction.next,
                        validator: Validators.required,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.email),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.done,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) return null;
                          return Validators.email(value);
                        },
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        child: PrimaryButton(
                          text: 'Complete Profile',
                          isLoading: isLoading,
                          onPressed: isLoading ? null : _completeProfile,
                        ),
                      ),
                      const SizedBox(height: 24),
                      TextButton(
                        onPressed: () => context.go('/login'),
                        child: const Text('Already have an account? Sign in'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}