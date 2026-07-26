import 'package:santmat_satsang_prachar/core/storage/utils/storage_path_builder.dart';

class StorageReferenceFactory {
  // Can be extended to return robust reference objects containing bucket info if needed
  static String createProfileRef(String userId) =>
      StoragePathBuilder.profilePicture(userId);
  static String createAudioRef(String audioId) =>
      StoragePathBuilder.audioFile(audioId);
  static String createBookRef(String bookId) =>
      StoragePathBuilder.bookPdf(bookId);
}
