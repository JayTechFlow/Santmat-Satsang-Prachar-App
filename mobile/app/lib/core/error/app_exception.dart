abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  const AppException(this.message, {this.code, this.details});

  @override
  String toString() =>
      'AppException(message: $message, code: $code, details: $details)';
}

class NetworkException extends AppException {
  const NetworkException(super.message, {super.code, super.details});
}

class ServerException extends AppException {
  const ServerException(super.message, {super.code, super.details});
}

class CacheException extends AppException {
  const CacheException(super.message, {super.code, super.details});
}

class UnknownException extends AppException {
  const UnknownException(super.message, {super.code, super.details});
}
