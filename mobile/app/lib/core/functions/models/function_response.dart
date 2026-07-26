class FunctionResponse {
  final Map<String, dynamic> data;
  final int statusCode;

  const FunctionResponse({required this.data, this.statusCode = 200});
}
