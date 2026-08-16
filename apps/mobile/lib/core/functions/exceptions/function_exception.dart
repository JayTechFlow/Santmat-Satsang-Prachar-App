class FunctionException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  FunctionException(this.message, {this.code, this.details});

  @override
  String toString() => 'FunctionException($code): $message';
}
