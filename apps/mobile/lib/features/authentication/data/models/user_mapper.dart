import 'package:firebase_auth/firebase_auth.dart' as fb;
import '../../domain/entities/user_entity.dart';

extension UserMapper on fb.User {
  UserEntity toEntity() {
    return UserEntity(
      id: uid,
      email: email,
      displayName: displayName,
      photoUrl: photoURL,
      phoneNumber: phoneNumber,
      isAnonymous: isAnonymous,
    );
  }
}
