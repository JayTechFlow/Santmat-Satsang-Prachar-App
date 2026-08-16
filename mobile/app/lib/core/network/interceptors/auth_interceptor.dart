import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../storage/secure_storage_service.dart';

/// Global provider reference for accessing secure storage from interceptor
late ProviderContainer _authInterceptorContainer;

void setAuthInterceptorContainer(ProviderContainer container) {
  _authInterceptorContainer = container;
}

class AuthInterceptor extends Interceptor {
  static const String _authHeader = 'Authorization';
  static const String _bearerPrefix = 'Bearer ';
  static const int _maxRetries = 1;
  int _retryCount = 0;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    try {
      final storage = _authInterceptorContainer.read(secureStorageServiceProvider);
      final accessToken = await storage.getAccessToken();
      
      if (accessToken != null && accessToken.isNotEmpty) {
        options.headers[_authHeader] = '$_bearerPrefix$accessToken';
      }
    } catch (e) {
      // If we can't get the token, continue without it
      // The request will fail with 401 and trigger refresh logic
    }
    
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && _retryCount < _maxRetries) {
      _retryCount++;
      
      try {
        final storage = _authInterceptorContainer.read(secureStorageServiceProvider);
        final refreshToken = await storage.getRefreshToken();
        
        if (refreshToken != null && refreshToken.isNotEmpty) {
          // Attempt to refresh the token
          final refreshed = await _refreshAccessToken(refreshToken);
          
          if (refreshed) {
            // Retry the original request with new token
            final storage = _authInterceptorContainer.read(secureStorageServiceProvider);
            final newAccessToken = await storage.getAccessToken();
            
            if (newAccessToken != null) {
              err.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
              _retryCount = 0;
              return handler.resolve(await _retryRequest(err.requestOptions));
            }
          }
        }
      } catch (e) {
        // Refresh failed, clear tokens and let the error propagate
        try {
          final storage = _authInterceptorContainer.read(secureStorageServiceProvider);
          await storage.clearAuthTokens();
        } catch (_) {}
      }
    }
    
    _retryCount = 0;
    super.onError(err, handler);
  }

  Future<bool> _refreshAccessToken(String refreshToken) async {
    try {
      // TODO: Implement actual token refresh call to Firebase Auth
      // This would typically call Firebase Auth's refresh token endpoint
      // For now, we'll use the Firebase Auth SDK directly
      // 
      // Example implementation:
      // final credential = await FirebaseAuth.instance
      //     .currentUser?.getIdToken(true);
      // if (credential != null) {
      //   final storage = _authInterceptorContainer.read(secureStorageServiceProvider);
      //   await storage.setAccessToken(credential);
      //   return true;
      // }
      
      // For now, return false to indicate refresh not implemented
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<Response<dynamic>> _retryRequest(RequestOptions requestOptions) async {
    final dio = Dio(BaseOptions(
      baseUrl: requestOptions.baseUrl,
      connectTimeout: requestOptions.connectTimeout,
      receiveTimeout: requestOptions.receiveTimeout,
    ));
    
    // Copy headers
    dio.options.headers.addAll(requestOptions.headers);
    
    return dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: Options(
        method: requestOptions.method,
        headers: requestOptions.headers,
        responseType: requestOptions.responseType,
        contentType: requestOptions.contentType,
        validateStatus: requestOptions.validateStatus,
        followRedirects: requestOptions.followRedirects,
        maxRedirects: requestOptions.maxRedirects,
      ),
    );
  }
}