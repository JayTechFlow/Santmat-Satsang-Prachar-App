import 'package:santmat_satsang_prachar/core/functions/client/cloud_function_client.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_request.dart';
import 'package:santmat_satsang_prachar/core/functions/models/function_result.dart';
import 'package:santmat_satsang_prachar/core/functions/exceptions/function_exception.dart';

class CallableFunctionService {
  final CloudFunctionClient _client;

  CallableFunctionService(this._client);

  Future<FunctionResult<Map<String, dynamic>>> execute(
    String name, {
    Map<String, dynamic> data = const {},
  }) async {
    try {
      final response = await _client.callFunction(
        FunctionRequest(name: name, data: data),
      );
      return FunctionResult.success(response.data);
    } on FunctionException catch (e) {
      return FunctionResult.failure(e.message);
    } catch (e) {
      return FunctionResult.failure(e.toString());
    }
  }
}
