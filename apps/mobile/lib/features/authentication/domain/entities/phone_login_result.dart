import 'user_entity.dart';

/// Outcome of a phone-OTP sign-in attempt.
///
/// Firebase Phone Auth intrinsically creates a Firebase identity once the OTP
/// is verified. That identity is distinct from a registered application
/// account (a document in `users/{uid}`). [PhoneLoginResult] lets the
/// presentation layer distinguish:
///
///   - [success]: identity exists AND the application profile exists.
///   - [notRegistered]: identity was created but `users/{uid}` does not exist.
///     The identity is cleaned up (signed out) so no empty account is created
///     from the login path; the user is offered Registration.
///   - [failure]: authentication itself failed (invalid/expired OTP, network…).
enum PhoneLoginStatus { success, notRegistered, failure }

class PhoneLoginResult {
  final PhoneLoginStatus status;
  final UserEntity? user;
  final Exception? error;

  const PhoneLoginResult.success(this.user)
      : status = PhoneLoginStatus.success,
        error = null;

  const PhoneLoginResult.notRegistered()
      : status = PhoneLoginStatus.notRegistered,
        user = null,
        error = null;

  const PhoneLoginResult.failure([this.error])
      : status = PhoneLoginStatus.failure,
        user = null;

  bool get isSuccess => status == PhoneLoginStatus.success;
  bool get isNotRegistered => status == PhoneLoginStatus.notRegistered;
}