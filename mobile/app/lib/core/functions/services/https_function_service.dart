import 'package:santmat_satsang_prachar/core/functions/client/cloud_function_client.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_request.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_result.dart';
import 'package:santmat_satsang_prachar/core/functions/exceptions/function_exception.dart';

class HttpsFunctionService {
  final CloudFunctionClient _client;

  HttpsFunctionService(this._client);

  Future<FunctionResult<Map<String, dynamic>>> get(
    String endpoint, {
    Map<String, dynamic> queryParams = const {},
  }) async {
    // In a real scenario, this would use package:http or dio for raw HTTP.
    // For this architecture, we proxy through the client if it supports HTTP semantics,
    // or simulate it. We will use a standard call for now.
    try {
      final response = await _client.callFunction(
        FunctionRequest(name: endpoint, data: queryParams),
      );
      return FunctionResult.success(response.data);
    } on FunctionException catch (e) {
      return FunctionResult.failure(e.message);
    } catch (e) {
      return FunctionResult.failure(e.toString());
    }
  }
}
