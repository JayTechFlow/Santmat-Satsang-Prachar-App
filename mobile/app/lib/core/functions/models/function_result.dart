class FunctionResult<T> {
  final T? data;
  final String? error;
  final bool isSuccess;

  const FunctionResult.success(this.data) : error = null, isSuccess = true;
  const FunctionResult.failure(this.error) : data = null, isSuccess = false;
}
