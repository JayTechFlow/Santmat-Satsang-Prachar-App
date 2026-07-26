import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/session_model.dart';
import 'auth_providers.dart';
import 'dart:developer' as developer;

class AuthStateNotifier extends Notifier<AsyncValue<SessionModel>> {
  StreamSubscription? _authSubscription;

  @override
  AsyncValue<SessionModel> build() {
    final repository = ref.read(authRepositoryProvider);

    _authSubscription = repository.authStateChanges.listen((user) {
      developer.log('8. Firebase authStateChanges emitted: user=${user?.id}');
      checkSession();
    });

    ref.onDispose(() {
      _authSubscription?.cancel();
    });

    Future.microtask(() => checkSession());
    return const AsyncValue.loading();
  }

  Future<void> checkSession() async {
    developer.log('9. checkSession() entered');
    // Idempotency: Don't set loading if we already have a valid session to avoid UI flicker
    if (!state.hasValue && !state.isLoading) {
      state = const AsyncValue.loading();
    }
    
    final useCase = ref.read(checkSessionUseCaseProvider);
    final result = await useCase.call();
    result.when(
      success: (session) {
        developer.log('11. SessionModel values: isAuthenticated=${session.isAuthenticated}, isFirstLaunch=${session.isFirstLaunch}, user.uid=${session.user?.id}');
        
        // Idempotency: Only update state if the session actually changed
        final currentSession = state.value;
        if (currentSession?.isAuthenticated != session.isAuthenticated || 
            currentSession?.isFirstLaunch != session.isFirstLaunch || 
            currentSession?.user?.id != session.user?.id) {
          state = AsyncValue.data(session);
        } else if (state.isLoading) {
          // If we were loading but the session is logically the same, we still need to exit loading state
          state = AsyncValue.data(session);
        }
      },
      failure: (error) {
        developer.log('11. SessionModel values: error=$error');
        state = AsyncValue.error(error, StackTrace.current);
      },
    );
    developer.log('10. checkSession() completed');
  }

  Future<void> completeOnboarding() async {
    final useCase = ref.read(completeOnboardingUseCaseProvider);
    final result = await useCase.call();
    if (result.isSuccess) {
      await checkSession(); 
    }
  }

  Future<void> signInWithGoogle() async {
    developer.log('3. signInWithGoogle() entered');
    state = const AsyncValue.loading();
    final useCase = ref.read(signInWithGoogleUseCaseProvider);
    final result = await useCase.call();
    
    if (result.isSuccess) {
      // Synchronization step: ensure state is correctly mapped if stream missed it or was delayed
      await checkSession();
    } else {
      state = AsyncValue.error(result.error!, StackTrace.current);
    }
  }

  Future<void> signInAnonymously() async {
    developer.log('2. signInAnonymously() entered');
    state = const AsyncValue.loading();
    final useCase = ref.read(signInAnonymouslyUseCaseProvider);
    final result = await useCase.call();
    
    if (result.isSuccess) {
      // Synchronization step: ensure state is correctly mapped if stream missed it or was delayed
      await checkSession();
    } else {
      state = AsyncValue.error(result.error!, StackTrace.current);
    }
  }

  Future<void> signOut() async {
    state = const AsyncValue.loading();
    final useCase = ref.read(signOutUseCaseProvider);
    await useCase.call();
    // No manual checkSession() here since we rely on the stream, but it's safe if it was added
  }
}

final authStateProvider =
    NotifierProvider<AuthStateNotifier, AsyncValue<SessionModel>>(() {
      return AuthStateNotifier();
    });
