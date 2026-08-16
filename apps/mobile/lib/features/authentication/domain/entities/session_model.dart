import 'user_entity.dart';

class SessionModel {
  final UserEntity? user;
  final bool isFirstLaunch;

  const SessionModel({this.user, required this.isFirstLaunch});

  bool get isAuthenticated => user != null;
}
