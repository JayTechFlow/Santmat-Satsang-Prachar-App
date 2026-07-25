import 'package:firebase_auth/firebase_auth.dart';
import '../../../../core/services/firestore_service.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../models/profile_dto.dart';
import 'profile_data_source.dart';

class FirestoreProfileDataSource implements ProfileDataSource {
  final FirestoreService _firestoreService;
  final FirebaseAuth _firebaseAuth;

  FirestoreProfileDataSource(this._firestoreService, {FirebaseAuth? firebaseAuth})
      : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  String get _userId => _firebaseAuth.currentUser?.uid ?? 'user_123';

  @override
  Future<UserProfileEntity> getProfile() async {
    final doc = await _firestoreService.getDocument(
      FirestoreCollections.users,
      _userId,
    );

    if (!doc.exists) {
      throw Exception('User profile not found');
    }

    final dto = ProfileDto.fromFirestore(doc);
    return dto.toEntity();
  }

  @override
  Future<void> updateProfile({
    required String name,
    required String phone,
  }) async {
    await _firestoreService.updateDocument(
      FirestoreCollections.users,
      _userId,
      {
        'name': name,
        'phone': phone,
      },
    );
  }

  @override
  Future<void> updateProfilePhoto(String photoPath) async {
    await _firestoreService.updateDocument(
      FirestoreCollections.users,
      _userId,
      {
        'photoUrl': photoPath,
      },
    );
  }

  @override
  Future<void> updatePreferences(UserPreferenceEntity preferences) async {
    await _firestoreService.updateDocument(
      FirestoreCollections.users,
      _userId,
      {
        'languageCode': preferences.languageCode,
        'themeMode': preferences.themeMode,
        'notificationsEnabled': preferences.notificationsEnabled,
      },
    );
  }
}
