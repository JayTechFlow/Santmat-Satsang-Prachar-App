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
      return FunctionResponse(
        data: Map<String, dynamic>.from(result.data as Map? ?? {}),
      );
    } on FirebaseFunctionsException catch (e) {
      throw FunctionException(
        e.message ?? 'Unknown error',
        code: e.code,
        details: e.details,
      );
    } catch (e) {
      throw FunctionException(e.toString());
    }
  }
}
