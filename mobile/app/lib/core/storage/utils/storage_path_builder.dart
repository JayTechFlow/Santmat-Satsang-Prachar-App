class StoragePathBuilder {
  static String profilePicture(String userId) =>
      'users/$userId/profile_picture.jpg';
  static String bookCover(String bookId) => 'books/$bookId/cover.jpg';
  static String bookPdf(String bookId) => 'books/$bookId/content.pdf';
  static String audioThumbnail(String audioId) =>
      'audios/$audioId/thumbnail.jpg';
  static String audioFile(String audioId) => 'audios/$audioId/audio.mp3';
  static String eventBanner(String eventId) => 'events/$eventId/banner.jpg';
  static String quoteImage(String quoteId) => 'quotes/$quoteId/image.jpg';
  static String donationReceipt(String receiptId) =>
      'donations/receipts/$receiptId.pdf';
  static String downloadableFile(String downloadId) =>
      'downloads/$downloadId/file';

  static String thumbnail(String originalPath) {
    final parts = originalPath.split('.');
    if (parts.length > 1) {
      final ext = parts.removeLast();
      return '${parts.join('.')}_thumb.$ext';
    }
    return '${originalPath}_thumb';
  }
}
