enum AuthStatus {
  bootstrapping,
  authLoading,
  unauthenticated,
  authenticated,
  accessDenied,
  suspended,
  error,
}

extension AuthStatusExtension on AuthStatus {
  bool get isAuthenticated => this == AuthStatus.authenticated;
  bool get isLoading => this == AuthStatus.authLoading || this == AuthStatus.bootstrapping;
}
