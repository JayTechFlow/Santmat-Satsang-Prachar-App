import 'package:cloud_functions/cloud_functions.dart';

class CloudFunctionsService {
  final FirebaseFunctions? _functionsOverride;

  CloudFunctionsService({FirebaseFunctions? functions}) 
      : _functionsOverride = functions;

  FirebaseFunctions get _functions => _functionsOverride ?? FirebaseFunctions.instance;

  Future<dynamic> callFunction(String functionName, {Map<String, dynamic>? parameters}) async {
    final callable = _functions.httpsCallable(functionName);
    final results = await callable.call(parameters);
    return results.data;
  }
}
