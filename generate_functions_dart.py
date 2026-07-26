import os

base_path = 'mobile/app/lib/core/functions'

files = {
    'models/function_result.dart': '''
class FunctionResult<T> {
  final T? data;
  final String? error;
  final bool isSuccess;

  const FunctionResult.success(this.data) : error = null, isSuccess = true;
  const FunctionResult.failure(this.error) : data = null, isSuccess = false;
}
''',
    'models/function_request.dart': '''
class FunctionRequest {
  final String name;
  final Map<String, dynamic> data;

  const FunctionRequest({required this.name, this.data = const {}});
}
''',
    'models/function_response.dart': '''
class FunctionResponse {
  final Map<String, dynamic> data;
  final int statusCode;

  const FunctionResponse({required this.data, this.statusCode = 200});
}
''',
    'exceptions/function_exception.dart': '''
class FunctionException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  FunctionException(this.message, {this.code, this.details});

  @override
  String toString() => 'FunctionException(\$code): \$message';
}
''',
    'client/cloud_function_client.dart': '''
import 'package:cloud_functions/cloud_functions.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_request.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_response.dart';
import 'package:santmat_satsang_prachar/core/functions/exceptions/function_exception.dart';
import 'package:santmat_satsang_prachar/core/functions/config/backend_api_configuration.dart';

class CloudFunctionClient {
  final FirebaseFunctions _functions;
  final BackendApiConfiguration _config;

  CloudFunctionClient(this._functions, this._config);

  Future<FunctionResponse> callFunction(FunctionRequest request) async {
    try {
      final callable = _functions.httpsCallable(
        request.name,
        options: HttpsCallableOptions(timeout: _config.timeout),
      );
      final result = await callable.call(request.data);
      return FunctionResponse(data: Map<String, dynamic>.from(result.data as Map? ?? {}));
    } on FirebaseFunctionsException catch (e) {
      throw FunctionException(e.message ?? 'Unknown error', code: e.code, details: e.details);
    } catch (e) {
      throw FunctionException(e.toString());
    }
  }
}
''',
    'services/callable_function_service.dart': '''
import 'package:santmat_satsang_prachar/core/functions/client/cloud_function_client.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_request.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_result.dart';
import 'package:santmat_satsang_prachar/core/functions/exceptions/function_exception.dart';

class CallableFunctionService {
  final CloudFunctionClient _client;

  CallableFunctionService(this._client);

  Future<FunctionResult<Map<String, dynamic>>> execute(String name, {Map<String, dynamic> data = const {}}) async {
    try {
      final response = await _client.callFunction(FunctionRequest(name: name, data: data));
      return FunctionResult.success(response.data);
    } on FunctionException catch (e) {
      return FunctionResult.failure(e.message);
    } catch (e) {
      return FunctionResult.failure(e.toString());
    }
  }
}
''',
    'services/https_function_service.dart': '''
import 'package:santmat_satsang_prachar/core/functions/client/cloud_function_client.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_request.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_result.dart';
import 'package:santmat_satsang_prachar/core/functions/exceptions/function_exception.dart';

class HttpsFunctionService {
  final CloudFunctionClient _client;

  HttpsFunctionService(this._client);

  Future<FunctionResult<Map<String, dynamic>>> get(String endpoint, {Map<String, dynamic> queryParams = const {}}) async {
    // In a real scenario, this would use package:http or dio for raw HTTP.
    // For this architecture, we proxy through the client if it supports HTTP semantics,
    // or simulate it. We will use a standard call for now.
    try {
      final response = await _client.callFunction(FunctionRequest(name: endpoint, data: queryParams));
      return FunctionResult.success(response.data);
    } on FunctionException catch (e) {
      return FunctionResult.failure(e.message);
    } catch (e) {
      return FunctionResult.failure(e.toString());
    }
  }
}
''',
    'registry/function_registry.dart': '''
class FunctionRegistry {
  // Authentication
  static const String validateToken = 'auth-validateToken';
  
  // Profile
  static const String getProfile = 'profile-getProfile';
  
  // Search
  static const String globalSearch = 'search-globalSearch';
  static const String autocomplete = 'search-autocomplete';
  
  // Events
  static const String registerEvent = 'events-register';
  
  // Notifications
  static const String subscribeTopic = 'notifications-subscribeTopic';
  
  // Donations
  static const String createPaymentIntent = 'donations-createPaymentIntent';
  static const String verifyPayment = 'donations-verifyPayment';
  
  // Media
  static const String generateSignedUrl = 'media-generateSignedUrl';
  
  // Admin
  static const String getDashboardStats = 'admin-getDashboardStats';
}
''',
    'config/backend_api_configuration.dart': '''
class BackendApiConfiguration {
  final Duration timeout;
  final String region;
  final String environment;

  const BackendApiConfiguration({
    this.timeout = const Duration(seconds: 30),
    this.region = 'us-central1',
    this.environment = 'production',
  });
}
'''
}

for rel_path, content in files.items():
    full_path = os.path.join(base_path, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\n')
