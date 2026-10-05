import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:santmat_satsang_prachar/core/storage/storage_service.dart';

/// The media data source and repository are defined once, in
/// `core/media/presentation/providers/media_providers.dart`, and re-exported
/// here so DI consumers keep resolving them from the service locator module.
export '../media/presentation/providers/media_providers.dart'
    show mediaRemoteDataSourceProvider, mediaRepositoryProvider;
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/features/audio/data/datasources/audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/data/datasources/firestore_audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/authentication/data/datasources/firebase_auth_datasource.dart';
import 'package:santmat_satsang_prachar/features/books/data/datasources/book_data_source.dart';
import 'package:santmat_satsang_prachar/features/books/data/datasources/firestore_book_data_source.dart';
import 'package:santmat_satsang_prachar/features/donations/data/datasources/donation_data_source.dart';
import 'package:santmat_satsang_prachar/features/donations/data/datasources/firestore_donation_data_source.dart';
import 'package:santmat_satsang_prachar/features/events/data/datasources/event_data_source.dart';
import 'package:santmat_satsang_prachar/features/events/data/datasources/firestore_event_data_source.dart';
import 'package:santmat_satsang_prachar/features/home/data/datasources/firebase_home_data_source.dart';
import 'package:santmat_satsang_prachar/features/home/data/datasources/home_data_source.dart';
import 'package:santmat_satsang_prachar/features/library/data/datasources/firestore_library_data_source.dart';
import 'package:santmat_satsang_prachar/features/library/data/datasources/library_data_source.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/datasources/firestore_notification_data_source.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/datasources/notification_data_source.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/datasources/firestore_preference_data_source.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/datasources/preference_data_source.dart';
import 'package:santmat_satsang_prachar/features/profile/data/datasources/firestore_profile_data_source.dart';
import 'package:santmat_satsang_prachar/features/profile/data/datasources/profile_data_source.dart';
import 'package:santmat_satsang_prachar/features/satsang/data/datasources/firestore_satsang_data_source.dart';
import 'package:santmat_satsang_prachar/features/satsang/data/datasources/satsang_data_source.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/firestore_search_data_source.dart';
import 'package:santmat_satsang_prachar/features/search/data/datasources/search_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/data/repositories/audio_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/authentication/data/repositories/auth_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/books/data/repositories/book_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/donations/data/repositories/donation_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/events/data/repositories/event_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/home/data/repositories/home_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/library/data/repositories/library_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/preferences/data/repositories/preference_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/profile/data/repositories/profile_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/satsang/data/repositories/satsang_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/search/data/repositories/search_repository_impl.dart';
import 'package:santmat_satsang_prachar/features/home/domain/repositories/home_repository.dart';
import 'package:santmat_satsang_prachar/features/preferences/domain/repositories/preference_repository.dart';
import 'package:santmat_satsang_prachar/features/donations/domain/repositories/donation_repository.dart';
import 'package:santmat_satsang_prachar/features/satsang/domain/repositories/satsang_repository.dart';
import 'package:santmat_satsang_prachar/features/library/domain/repositories/library_repository.dart';
import 'package:santmat_satsang_prachar/features/books/domain/repositories/book_repository.dart';
import 'package:santmat_satsang_prachar/features/search/domain/repositories/search_repository.dart';
import 'package:santmat_satsang_prachar/features/audio/domain/repositories/audio_repository.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/repositories/profile_repository.dart';
import 'package:santmat_satsang_prachar/features/events/domain/repositories/event_repository.dart';
import 'package:santmat_satsang_prachar/features/authentication/domain/repositories/auth_repository.dart';
import 'package:santmat_satsang_prachar/features/notifications/domain/repositories/notification_repository.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/data/datasources/stuti_vinati_remote_datasource.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/data/datasources/stuti_vinati_firebase_datasource.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/domain/repositories/stuti_vinati_repository.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/data/repositories/stuti_vinati_repository_impl.dart';

final homeDataSourceProvider = Provider<HomeDataSource>((ref) {
  return FirebaseHomeDataSource(ref.watch(firestoreServiceProvider));
});

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl(ref.watch(homeDataSourceProvider));
});

final preferenceDataSourceProvider = Provider<PreferenceDataSource>((ref) {
  return FirestorePreferenceDataSource(ref.watch(firestoreServiceProvider));
});

final preferenceRepositoryProvider = Provider<PreferenceRepository>((ref) {
  return PreferenceRepositoryImpl(ref.watch(preferenceDataSourceProvider));
});

final donationDataSourceProvider = Provider<DonationDataSource>((ref) {
  return FirestoreDonationDataSource(ref.watch(firestoreServiceProvider));
});

final donationRepositoryProvider = Provider<DonationRepository>((ref) {
  return DonationRepositoryImpl(ref.watch(donationDataSourceProvider));
});

final satsangDataSourceProvider = Provider<SatsangDataSource>((ref) {
  return FirestoreSatsangDataSource(ref.watch(firestoreServiceProvider));
});

final satsangRepositoryProvider = Provider<SatsangRepository>((ref) {
  return SatsangRepositoryImpl(ref.watch(satsangDataSourceProvider));
});

final libraryDataSourceProvider = Provider<LibraryDataSource>((ref) {
  return FirestoreLibraryDataSource(ref.watch(firestoreServiceProvider));
});

final libraryRepositoryProvider = Provider<LibraryRepository>((ref) {
  return LibraryRepositoryImpl(ref.watch(libraryDataSourceProvider));
});

final bookDataSourceProvider = Provider<BookDataSource>((ref) {
  return FirestoreBookDataSource(ref.watch(firestoreServiceProvider));
});

final bookRepositoryProvider = Provider<BookRepository>((ref) {
  return BookRepositoryImpl(ref.watch(bookDataSourceProvider));
});


final searchDataSourceProvider = Provider<SearchDataSource>((ref) {
  return FirestoreSearchDataSource(ref.watch(firestoreServiceProvider));
});

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  return SearchRepositoryImpl(ref.watch(searchDataSourceProvider));
});

final audioDataSourceProvider = Provider<AudioDataSource>((ref) {
  return FirestoreAudioDataSource(ref.watch(firestoreServiceProvider));
});

final audioRepositoryProvider = Provider<AudioRepository>((ref) {
  return AudioRepositoryImpl(ref.watch(audioDataSourceProvider));
});

final profileDataSourceProvider = Provider<ProfileDataSource>((ref) {
  return FirestoreProfileDataSource(ref.watch(firestoreServiceProvider));
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(
    ref.watch(profileDataSourceProvider),
    ref.watch(authRepositoryProvider),
  );
});

final eventDataSourceProvider = Provider<EventDataSource>((ref) {
  return FirestoreEventDataSource(ref.watch(firestoreServiceProvider));
});

final eventRepositoryProvider = Provider<EventRepository>((ref) {
  return EventRepositoryImpl(ref.watch(eventDataSourceProvider));
});

final authDataSourceProvider = Provider<FirebaseAuthDataSource>((ref) {
  return FirebaseAuthDataSource(FirebaseAuth.instance);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    ref.watch(authDataSourceProvider),
    ref.watch(sharedPreferencesProvider),
    ref,
  );
});

final notificationDataSourceProvider = Provider<NotificationDataSource>((ref) {
  return FirestoreNotificationDataSource(ref.watch(firestoreServiceProvider));
});

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  return NotificationRepositoryImpl(ref.watch(notificationDataSourceProvider));
});

final stutiVinatiDataSourceProvider = Provider<StutiVinatiRemoteDataSource>((
  ref,
) {
  return StutiVinatiFirebaseDataSource(FirebaseFirestore.instance);
});

final stutiVinatiRepositoryProvider = Provider<StutiVinatiRepository>((ref) {
  return StutiVinatiRepositoryImpl(ref.watch(stutiVinatiDataSourceProvider));
});
