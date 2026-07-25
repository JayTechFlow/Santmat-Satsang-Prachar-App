import 'app_exception.dart';

abstract class Failure {
  final String message;
  final Exception? exception;

  const Failure(this.message, {this.exception});
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message, {super.exception});
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.exception});
}

class CacheFailure extends Failure {
  const CacheFailure(super.message, {super.exception});
}

class UnknownFailure extends Failure {
  const UnknownFailure(super.message, {super.exception});
}

extension ExceptionToFailure on Exception {
  Failure toFailure() {
    if (this is NetworkException) {
      return NetworkFailure(
        (this as NetworkException).message,
        exception: this,
      );
    } else if (this is ServerException) {
      return ServerFailure((this as ServerException).message, exception: this);
    } else if (this is CacheException) {
      return CacheFailure((this as CacheException).message, exception: this);
    } else if (this is AppException) {
      return UnknownFailure((this as AppException).message, exception: this);
    } else {
      return UnknownFailure(toString(), exception: this);
    }
  }
}
