import '../../domain/entities/users_entity.dart';

class UserEntityDto extends UserEntity {
  const UserEntityDto({
    required super.id,
    required super.name,
    required super.email,
    super.phone,
    super.photoUrl,
    required super.createdAt,
  });

  factory UserEntityDto.fromJson(Map<String, dynamic> json, [String? id]) {
    return UserEntityDto(
      id: id ?? json['id'] as String? ?? '',
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      photoUrl: json['photoUrl'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'photoUrl': photoUrl,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
