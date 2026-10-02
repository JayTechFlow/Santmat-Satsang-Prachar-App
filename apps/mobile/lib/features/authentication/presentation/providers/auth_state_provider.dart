import 'package:flutter/foundation.dart';
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/session_model.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/entities/phone_login_result.dart';
import '../../domain/entities/google_login_result.dart';
import 'auth_providers.dart';
import 'dart:developer' as developer;
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';

// Bypass flag for development
const bool _bypassAuth = bool.fromEnvironment('BYPASS_AUTH', defaultValue: false);
bool get _shouldBypassAuth => kDebugMode && _bypassAuth;

class AuthStateNotifier extends Notifier<AsyncValue<SessionModel>> {
  StreamSubscription? _authSubscription;

  /// While true, the notifier suppresses session emission so an in-progress
  /// registration (identity verified but profile not yet created) is not
  /// mistaken for a complete, authenticated login by the router guard.
  bool _registrationInProgress = false;

  void beginRegistration() => _registrationInProgress = true;

  void endRegistration() {
    _registrationInProgress = false;
    // Re-evaluate the session: if only an orphaned identity remains (no
    // registered profile), it will be signed out by [checkSession].
    Future.microtask(checkSession);
  }

  @override
  AsyncValue<SessionModel> build() {
    if (_shouldBypassAuth) {
      developer.log('AUTH BYPASS ENABLED: Returning mock session');
      return AsyncValue.data(
        SessionModel(
          isFirstLaunch: false,
          user: UserEntity(
            id: 'dev_bypass_user',
            displayName: 'Dev User',
            isAnonymous: false,
          ),
        ),
      );
    }

    final repository = ref.read(authRepositoryProvider);

    _authSubscription = repository.authStateChanges.listen((user) {
      if (kDebugMode) {
        developer.log('8. Firebase authStateChanges emitted: user=${user?.id}');
      }
      checkSession();
    });

    ref.onDispose(() {
      _authSubscription?.cancel();
    });

    Future.microtask(() => checkSession());
    return const AsyncValue.loading();
  }

  Future<void> checkSession() async {
    if (_shouldBypassAuth) return;
    if (_registrationInProgress) return;

    if (kDebugMode) {
      developer.log('9. checkSession() entered');
    }

    try {
      final useCase = ref.read(checkSessionUseCaseProvider);
      final result = await useCase.call();
      result.when(
        success: (session) async {
          final user = session.user;
          if (user != null) {
            final hasProfile = await ref
                .read(hasRegisteredProfileUseCaseProvider)
                .call(user.id);
            if (hasProfile.isSuccess && hasProfile.data == false) {
              // Identity exists but no `users/{uid}` profile. No empty
              // account must be created from a session check — sign out so a
              // fresh, deliberate login/registration flows the user to the
              // correct destination.
              if (kDebugMode) {
                developer.log(
                  'checkSession: identity without profile, signing out.',
                );
              }
              await signOut();
              return;
            }
          }
          if (kDebugMode) {
            developer.log(
              '11. SessionModel values: isAuthenticated=${session.isAuthenticated}, isFirstLaunch=${session.isFirstLaunch}, user.uid=${session.user?.id}',
            );
          }
          state = AsyncValue.data(session);
        },
        failure: (error) {
          if (kDebugMode) {
            developer.log('11. SessionModel failure: error=$error');
          }
          state = AsyncValue.data(const SessionModel(isFirstLaunch: false));
        },
      );
    } catch (e) {
      if (kDebugMode) {
        developer.log('11. SessionModel exception: $e');
      }
      state = AsyncValue.data(const SessionModel(isFirstLaunch: false));
    }

    if (kDebugMode) {
      developer.log('10. checkSession() completed, state=$state');
    }
  }

  Future<void> completeOnboarding() async {
    final useCase = ref.read(completeOnboardingUseCaseProvider);
    final result = await useCase.call();
    if (result.isSuccess) {
      await checkSession();
    }
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(String verificationId) codeSent,
    required void Function(Exception error) verificationFailed,
  }) async {
    if (kDebugMode) {
      developer.log('3. verifyPhoneNumber called for $phoneNumber');
    }
    final useCase = ref.read(verifyPhoneNumberUseCaseProvider);
    final result = await useCase.call(
      phoneNumber: phoneNumber,
      codeSent: codeSent,
      verificationFailed: (error) {
        verificationFailed(error);
      },
    );
    if (!result.isSuccess) {
      state = AsyncValue.error(result.error!, StackTrace.current);
    }
  }

  /// Verifies the OTP and signs the user in with phone auth.
  ///
  /// Resolves the verified identity against the canonical `users/{uid}`
  /// registry. If no application profile exists the identity is signed out
  /// (no empty account is created from the login path) and the caller is
  /// routed to Registration.
  Future<PhoneLoginResult> signInWithPhone(
    String verificationId,
    String smsCode,
  ) async {
    if (kDebugMode) {
      developer.log('3. signInWithPhone called');
    }
    state = const AsyncValue.loading();
    final useCase = ref.read(signInWithPhoneUseCaseProvider);
    final result = await useCase.call(verificationId, smsCode);
    if (result.isError) {
      state = AsyncValue.error(result.error!, StackTrace.current);
      return PhoneLoginResult.failure(result.error);
    }
    final user = result.data!;

    final hasProfile =
        await ref.read(hasRegisteredProfileUseCaseProvider).call(user.id);
    if (hasProfile.isError) {
      state = AsyncValue.error(hasProfile.error!, StackTrace.current);
      return PhoneLoginResult.failure(hasProfile.error);
    }

    if (hasProfile.data == true) {
      await checkSession();
      return PhoneLoginResult.success(user);
    }

    // Not registered: sign out so no orphaned usable identity remains.
    await signOut();
    return const PhoneLoginResult.notRegistered();
  }

  /// Verifies an OTP during Registration without treating the resulting
  /// identity as a completed login. The identity stays signed in so
  /// [registerWithPhone] can attach the canonical profile; session emission
  /// is suppressed until registration completes.
  Future<Result<UserEntity>> authenticateForRegistration(
    String verificationId,
    String smsCode,
  ) async {
    if (_shouldBypassAuth) {
      return Result.failure(Exception('Auth bypass is enabled.'));
    }
    if (kDebugMode) {
      developer.log('3. authenticateForRegistration called');
    }
    state = const AsyncValue.loading();
    final useCase = ref.read(signInWithPhoneUseCaseProvider);
    final result = await useCase.call(verificationId, smsCode);
    if (result.isError) {
      state = AsyncValue.error(result.error!, StackTrace.current);
    }
    return result;
  }

  /// Signs in with Google authentication and resolves against `users/{uid}`.
  Future<GoogleLoginResult> signInWithGoogle() async {
    state = const AsyncValue.loading();
    beginRegistration();
    final useCase = ref.read(signInWithGoogleUseCaseProvider);
    final result = await useCase.call();
    if (result.isError) {
      endRegistration();
      state = AsyncValue.error(result.error!, StackTrace.current);
      return GoogleLoginResult.failure(result.error);
    }
    final user = result.data;
    if (user == null) {
      endRegistration();
      state = AsyncValue.data(const SessionModel(isFirstLaunch: false));
      return const GoogleLoginResult.canceled();
    }

    final hasProfile =
        await ref.read(hasRegisteredProfileUseCaseProvider).call(user.id);
    if (hasProfile.isError) {
      endRegistration();
      state = AsyncValue.error(hasProfile.error!, StackTrace.current);
      return GoogleLoginResult.failure(hasProfile.error);
    }

    if (hasProfile.data == true) {
      endRegistration();
      await checkSession();
      return GoogleLoginResult.success(user);
    }

    // First-time Google user: keep identity signed in so completeProfile can attach users/{uid}.
    // Keep session unauthenticated until registerUserProfile attaches the profile in users/{uid}.
    beginRegistration();
    state = AsyncValue.data(const SessionModel(isFirstLaunch: false));
    return GoogleLoginResult.notRegistered(user);
  }

  /// Completes registration for an authenticated Google user by creating `users/{uid}`.
  Future<void> registerUserProfile({
    required String name,
    String? email,
  }) async {
    state = const AsyncValue.loading();
    final useCase = ref.read(registerUserProfileUseCaseProvider);
    final result = await useCase.call(name: name, email: email);
    endRegistration();
    if (result.isSuccess) {
      await checkSession();
    } else {
      state = AsyncValue.error(result.error!, StackTrace.current);
    }
  }

  /// Completes registration for the currently verified phone user by creating
  /// the canonical `users/{uid}` profile.
  Future<void> registerWithPhone({
    required String name,
    String? email,
  }) async {
    if (kDebugMode) {
      developer.log('3. registerWithPhone called for $name');
    }
    state = const AsyncValue.loading();
    final useCase = ref.read(registerWithPhoneUseCaseProvider);
    final result = await useCase.call(name: name, email: email);
    if (result.isSuccess) {
      await checkSession();
    } else {
      state = AsyncValue.error(result.error!, StackTrace.current);
    }
  }

  Future<void> signOut() async {
    if (_shouldBypassAuth) {
      if (kDebugMode) {
        developer.log('AUTH BYPASS ENABLED: Skipping signOut');
      }
      return;
    }
    state = const AsyncValue.loading();
    final useCase = ref.read(signOutUseCaseProvider);
    await useCase.call();
    state = const AsyncValue.data(SessionModel(isFirstLaunch: false));
  }
}

final authStateProvider =
    NotifierProvider<AuthStateNotifier, AsyncValue<SessionModel>>(() {
      return AuthStateNotifier();
    });