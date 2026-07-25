import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore? _firestoreOverride;

  FirestoreService({FirebaseFirestore? firestore}) 
      : _firestoreOverride = firestore;

  FirebaseFirestore get _firestore => _firestoreOverride ?? FirebaseFirestore.instance;

  Future<DocumentSnapshot> getDocument(String collectionPath, String documentId) async {
    return await _firestore.collection(collectionPath).doc(documentId).get();
  }

  Future<QuerySnapshot> getCollection(String collectionPath) async {
    return await _firestore.collection(collectionPath).get();
  }

  Future<void> addDocument(String collectionPath, Map<String, dynamic> data) async {
    await _firestore.collection(collectionPath).add(data);
  }

  Future<void> updateDocument(String collectionPath, String documentId, Map<String, dynamic> data) async {
    await _firestore.collection(collectionPath).doc(documentId).update(data);
  }

  Future<void> setDocument(String collectionPath, String documentId, Map<String, dynamic> data, {bool merge = false}) async {
    await _firestore.collection(collectionPath).doc(documentId).set(data, SetOptions(merge: merge));
  }

  Future<void> deleteDocument(String collectionPath, String documentId) async {
    await _firestore.collection(collectionPath).doc(documentId).delete();
  }

  Future<QuerySnapshot> queryCollection(String collectionPath, Query<Map<String, dynamic>> Function(CollectionReference<Map<String, dynamic>>) queryBuilder) async {
    return await queryBuilder(_firestore.collection(collectionPath)).get();
  }
}
