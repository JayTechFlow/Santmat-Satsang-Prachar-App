import 'package:dio/dio.dart';

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Placeholder for auth token injection
    // final token = await authService.getToken();
    // if (token != null) {
    //   options.headers['Authorization'] = 'Bearer $token';
    // }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Placeholder for token refresh logic
    // if (err.response?.statusCode == 401) {
    //   // handle unauthorized
    // }
    super.onError(err, handler);
  }
}
