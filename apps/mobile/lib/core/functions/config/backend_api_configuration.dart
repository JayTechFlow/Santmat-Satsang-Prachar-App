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
