import 'package:firebase_messaging/firebase_messaging.dart';

class FirebaseMessagingService {
  final FirebaseMessaging? _messagingOverride;

  FirebaseMessagingService({FirebaseMessaging? messaging}) 
      : _messagingOverride = messaging;

  FirebaseMessaging get _messaging => _messagingOverride ?? FirebaseMessaging.instance;

  Future<void> requestPermission() async {
    await _messaging.requestPermission();
  }

  Future<String?> getToken() async {
    return await _messaging.getToken();
  }

  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }

  Stream<RemoteMessage> get onMessage => FirebaseMessaging.onMessage;
  Stream<RemoteMessage> get onMessageOpenedApp => FirebaseMessaging.onMessageOpenedApp;
}
