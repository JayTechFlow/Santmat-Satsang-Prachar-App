class Result<T> {
  final T? data;
  final Exception? error;

  const Result.success(this.data) : error = null;
  const Result.failure(this.error) : data = null;

  bool get isSuccess => error == null;
  bool get isError => error != null;

  void when({
    required void Function(T data) success,
    required void Function(Exception error) failure,
  }) {
    if (isSuccess) {
      success(data as T);
    } else {
      failure(error!);
    }
  }
}
