import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/session_model.dart';
import 'auth_providers.dart';

class AuthStateNotifier extends Notifier<AsyncValue<SessionModel>> {
  @override
  AsyncValue<SessionModel> build() {
    // Check session on build
    Future.microtask(() => checkSession());
    return const AsyncValue.loading();
  }

  Future<void> checkSession() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(checkSessionUseCaseProvider);
    final result = await useCase.call();
    result.when(
      success: (session) {
        state = AsyncValue.data(session);
      },
      failure: (error) {
        state = AsyncValue.error(error, StackTrace.current);
      },
    );
  }

  Future<void> completeOnboarding() async {
    final useCase = ref.read(completeOnboardingUseCaseProvider);
    final result = await useCase.call();
    if (result.isSuccess) {
      checkSession();
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(signInWithGoogleUseCaseProvider);
    final result = await useCase.call();
    result.when(
      success: (_) {
        checkSession();
      },
      failure: (error) {
        state = AsyncValue.error(error, StackTrace.current);
      },
    );
  }

  Future<void> signInAnonymously() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(signInAnonymouslyUseCaseProvider);
    final result = await useCase.call();
    result.when(
      success: (_) {
        checkSession();
      },
      failure: (error) {
        state = AsyncValue.error(error, StackTrace.current);
      },
    );
  }

  Future<void> signOut() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(signOutUseCaseProvider);
    await useCase.call();
    checkSession();
  }
}

final authStateProvider =
    NotifierProvider<AuthStateNotifier, AsyncValue<SessionModel>>(() {
      return AuthStateNotifier();
    });
