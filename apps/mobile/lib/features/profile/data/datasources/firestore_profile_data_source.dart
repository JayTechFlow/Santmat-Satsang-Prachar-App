import '../../../../core/services/firestore_service.dart';
import '../../../../core/firebase/firestore_collections.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../domain/entities/user_preference_entity.dart';
import '../models/profile_dto.dart';
import 'profile_data_source.dart';

class FirestoreProfileDataSource implements ProfileDataSource {
  final FirestoreService _firestoreService;

  FirestoreProfileDataSource(this._firestoreService);

  @override
  Future<UserProfileEntity> getProfile({required String userId}) async {
    if (userId.isEmpty) {
      throw Exception('User not authenticated');
    }
    final doc = await _firestoreService.getDocument(
      FirestoreCollections.users,
      userId,
    );

    if (!doc.exists) {
      throw Exception('User profile not found');
    }

    final dto = ProfileDto.fromFirestore(doc);
    return dto.toEntity();
  }

  @override
  Future<void> updateProfile({
    required String userId,
    required String name,
    required String phone,
    String? email,
  }) async {
    final payload = <String, dynamic>{
      'name': name,
      'displayName': name,
      'phone': phone,
      'email': (email != null && email.isNotEmpty) ? email : null,
    };
    await _firestoreService.updateDocument(
      FirestoreCollections.users,
      userId,
      payload,
    );
  }

  @override
  Future<void> updateProfilePhoto({
    required String userId,
    required String? photoPath,
  }) async {
    await _firestoreService.updateDocument(FirestoreCollections.users, userId, {
      'customPhotoUrl': photoPath,
      'photoUrl': photoPath,
    });
  }

  @override
  Future<void> updatePreferences({
    required String userId,
    required UserPreferenceEntity preferences,
  }) async {
    await _firestoreService.updateDocument(FirestoreCollections.users, userId, {
      'languageCode': preferences.languageCode,
      'themeMode': preferences.themeMode,
      'notificationsEnabled': preferences.notificationsEnabled,
      'devanagariFontScale': preferences.devanagariFontScale,
      'audioQuality': preferences.audioQuality,
    });
  }
}
