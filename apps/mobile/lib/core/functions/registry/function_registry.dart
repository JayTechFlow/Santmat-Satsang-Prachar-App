class FunctionRegistry {
  // Authentication
  static const String validateToken = 'auth-validateToken';

  // Profile
  static const String getProfile = 'profile-getProfile';

  // Search
  static const String globalSearch = 'search-globalSearch';
  static const String autocomplete = 'search-autocomplete';

  // Events
  static const String registerEvent = 'events-register';

  // Notifications
  static const String subscribeTopic = 'notifications-subscribeTopic';

  // Donations
  static const String createPaymentIntent = 'donations-createPaymentIntent';
  static const String verifyPayment = 'donations-verifyPayment';

  // Media
  static const String generateSignedUrl = 'media-generateSignedUrl';

  // Admin
  static const String getDashboardStats = 'admin-getDashboardStats';
}
