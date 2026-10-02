import 'user_entity.dart';

enum GoogleLoginStatus { success, notRegistered, canceled, failure }

class GoogleLoginResult {
  final GoogleLoginStatus status;
  final UserEntity? user;
  final Exception? error;

  const GoogleLoginResult.success(this.user)
      : status = GoogleLoginStatus.success,
        error = null;

  const GoogleLoginResult.notRegistered(this.user)
      : status = GoogleLoginStatus.notRegistered,
        error = null;

  const GoogleLoginResult.canceled()
      : status = GoogleLoginStatus.canceled,
        user = null,
        error = null;

  const GoogleLoginResult.failure([this.error])
      : status = GoogleLoginStatus.failure,
        user = null;

  bool get isSuccess => status == GoogleLoginStatus.success;
  bool get isNotRegistered => status == GoogleLoginStatus.notRegistered;
  bool get isCanceled => status == GoogleLoginStatus.canceled;
  bool get isFailure => status == GoogleLoginStatus.failure;
}
