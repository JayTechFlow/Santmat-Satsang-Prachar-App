import 'package:dio/dio.dart';
import 'app_exception.dart';

class ErrorMapper {
  const ErrorMapper._();

  static AppException map(dynamic error) {
    if (error is DioException) {
      return _mapDioException(error);
    }
    if (error is AppException) {
      return error;
    }
    return UnknownException(error.toString());
  }

  static AppException _mapDioException(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return NetworkException(
          'Network connection failed.',
          details: error.message,
        );
      case DioExceptionType.badResponse:
        return ServerException(
          'Server returned an error.',
          code: error.response?.statusCode?.toString(),
        );
      default:
        return UnknownException(
          'An unexpected network error occurred.',
          details: error.message,
        );
    }
  }
}
