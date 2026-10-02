import 'package:flutter_test/flutter_test.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:santmat_satsang_prachar/features/audio/data/models/audio_dto.dart';
import 'package:santmat_satsang_prachar/features/books/data/models/book_dto.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/data/models/daily_quote_dto.dart';
import 'package:santmat_satsang_prachar/features/stuti_vinati/data/models/stuti_vinati_dto.dart';
import 'package:santmat_satsang_prachar/features/notifications/data/models/notification_dto.dart';
import 'package:santmat_satsang_prachar/features/home/data/models/home_banners_dto.dart';
import 'package:santmat_satsang_prachar/features/profile/data/models/profile_dto.dart';

// ignore: subtype_of_sealed_class
class _FakeDocumentSnapshot implements DocumentSnapshot {
  @override
  final String id;
  final Map<String, dynamic> _data;

  _FakeDocumentSnapshot(this.id, this._data);

  @override
  Map<String, dynamic> data() => _data;

  @override
  dynamic get(Object field) => _data[field.toString()];

  @override
  dynamic operator [](Object field) => _data[field.toString()];

  @override
  bool get exists => true;

  @override
  SnapshotMetadata get metadata => throw UnimplementedError();

  @override
  DocumentReference get reference => throw UnimplementedError();
}

void main() {
  group('Master Data Contract Consistency Tests (Admin -> Firebase -> Mobile)', () {
    test('Bhajan/Audio Contract: Maps Admin write payload cleanly to Mobile AudioDto', () {
      final adminBhajanPayload = {
        'title': 'प्रभु से प्रीत लगाई रे',
        'artist': 'स्वर : पूज्य स्वामी जी',
        'category': 'पदावली भजन',
        'subCategory': 'महर्षि मेँहीं पदावली',
        'duration': '08:30',
        'durationSeconds': 510,
        'audioUrl': 'https://storage.googleapis.com/test-bucket/audio/bhajan1.mp3',
        'imageUrl': 'https://storage.googleapis.com/test-bucket/images/bhajan1.jpg',
        'plays': 1500,
        'addedDate': '2026-05-27T10:00:00.000Z',
        'lyrics': 'प्रभु से प्रीत लगाई रे मनवा...',
        'status': 'प्रकाशित',
      };

      final doc = _FakeDocumentSnapshot('audio-doc-123', adminBhajanPayload);
      final dto = AudioDto.fromFirestore(doc);
      final entity = dto.toEntity();

      expect(entity.id, equals('audio-doc-123'));
      expect(entity.title, equals('प्रभु से प्रीत लगाई रे'));
      expect(entity.speaker, equals('स्वर : पूज्य स्वामी जी'));
      expect(entity.category.name, equals('पदावली भजन'));
      expect(entity.subtitle, equals('महर्षि मेँहीं पदावली'));
      expect(entity.duration.inMinutes, equals(8));
      expect(entity.audioUrl, equals('https://storage.googleapis.com/test-bucket/audio/bhajan1.mp3'));
      expect(entity.thumbnailUrl, equals('https://storage.googleapis.com/test-bucket/images/bhajan1.jpg'));
      expect(entity.playCount, equals(1500));
      expect(entity.description, equals('प्रभु से प्रीत लगाई रे मनवा...'));
    });

    test('Stuti/Vinati Contract: Maps Admin write payload cleanly to Mobile StutiVinatiDto', () {
      final adminStutiPayload = {
        'id': 'stuti-doc-1',
        'type': 'morning',
        'title': 'गुरु वंदना',
        'subtitle': 'प्रभात कालीन वंदना',
        'artist': 'संतमत सत्संग',
        'duration': '05:15',
        'durationSeconds': 315,
        'bannerImage': 'https://storage.googleapis.com/test-bucket/banners/stuti1.jpg',
        'quote': 'सद्गुरु महाराज की जय',
        'lyrics': 'जय गुरु जय गुरु जय गुरु...',
        'audioUrl': 'https://storage.googleapis.com/test-bucket/audio/stuti1.mp3',
      };

      final dto = StutiVinatiDto.fromJson(adminStutiPayload);

      expect(dto.id, equals('stuti-doc-1'));
      expect(dto.title, equals('गुरु वंदना'));
      expect(dto.subtitle, equals('प्रभात कालीन वंदना'));
      expect(dto.artist, equals('संतमत सत्संग'));
      expect(dto.bannerImage, equals('https://storage.googleapis.com/test-bucket/banners/stuti1.jpg'));
      expect(dto.textContent, equals('जय गुरु जय गुरु जय गुरु...'));
      expect(dto.audioUrl, equals('https://storage.googleapis.com/test-bucket/audio/stuti1.mp3'));
      expect(dto.type, equals('morning'));
    });

    test('Suvichar/Daily Quotes Contract: Maps Admin write payload cleanly to QuoteDto', () {
      final adminSuvicharPayload = {
        'quote': 'सत्संग ही जीवन का सच्चा आधार है।',
        'author': 'महर्षि मेँहीं परमहंस जी',
        'theme': 'साधना एवं सत्संग',
        'imageUrl': 'https://storage.googleapis.com/test-bucket/suvichar/quote1.jpg',
        'isSpecialPoster': true,
        'createdAt': '2026-06-01T06:00:00.000Z',
      };

      final doc = _FakeDocumentSnapshot('suvichar-101', adminSuvicharPayload);
      final dto = QuoteDto.fromFirestore(doc);
      final entity = dto.toEntity();

      expect(entity.id, equals('suvichar-101'));
      expect(entity.quoteText, equals('सत्संग ही जीवन का सच्चा आधार है।'));
      expect(entity.author.name, equals('महर्षि मेँहीं परमहंस जी'));
      expect(entity.category.name, equals('साधना एवं सत्संग'));
      expect(entity.backgroundImageUrl, equals('https://storage.googleapis.com/test-bucket/suvichar/quote1.jpg'));
      expect(entity.isFeatured, isTrue);
    });

    test('Book Contract: Maps Admin write payload cleanly to BookDto', () {
      final adminBookPayload = {
        'title': 'सत्संग सुधा',
        'author': 'महर्षि मेँहीं परमहंस',
        'category': 'आध्यात्मिक साहित्य',
        'coverUrl': 'https://storage.googleapis.com/test-bucket/books/covers/cover1.jpg',
        'pdfUrl': 'https://storage.googleapis.com/test-bucket/books/pdfs/book1.pdf',
        'pagesCount': 120,
        'publishDate': '2025-01-01T00:00:00.000Z',
        'status': 'published',
      };

      final doc = _FakeDocumentSnapshot('book-doc-5', adminBookPayload);
      final dto = BookDto.fromFirestore(doc);
      final entity = dto.toEntity();

      expect(entity.id, equals('book-doc-5'));
      expect(entity.title, equals('सत्संग सुधा'));
      expect(entity.author.name, equals('महर्षि मेँहीं परमहंस'));
      expect(entity.category.name, equals('आध्यात्मिक साहित्य'));
      expect(entity.coverImageUrl, equals('https://storage.googleapis.com/test-bucket/books/covers/cover1.jpg'));
      expect(entity.pdfUrlPlaceholder, equals('https://storage.googleapis.com/test-bucket/books/pdfs/book1.pdf'));
      expect(entity.pageCount, equals(120));
    });

    test('Notification Contract: Maps Admin write payload cleanly to NotificationDto', () {
      final adminNotificationPayload = {
        'title': 'नया सत्संग भजन',
        'message': 'पूज्य महाराज जी का पावन भजन ऐप में उपलब्ध है।',
        'type': 'bhajan',
        'date': '2026-08-20T12:00:00.000Z',
        'isRead': false,
      };

      final doc = _FakeDocumentSnapshot('notif-99', adminNotificationPayload);
      final entity = NotificationDto.fromFirestore(doc);

      expect(entity.id, equals('notif-99'));
      expect(entity.title, equals('नया सत्संग भजन'));
      expect(entity.body, equals('पूज्य महाराज जी का पावन भजन ऐप में उपलब्ध है।'));
      expect(entity.category.name, equals('bhajan'));
      expect(entity.isRead, isFalse);
    });

    test('Banner Contract: Maps Admin write payload cleanly to HomeBannerDto', () {
      final adminBannerPayload = {
        'id': 'banner-1',
        'title': 'वार्षिक सत्संग समारोह',
        'imageUrl': 'https://storage.googleapis.com/test-bucket/banners/banner1.jpg',
        'targetScreen': '/events/annual-satsang',
        'active': true,
        'order': 1,
      };

      final dto = HomeBannerDto.fromJson(adminBannerPayload);

      expect(dto.id, equals('banner-1'));
      expect(dto.imageUrl, equals('https://storage.googleapis.com/test-bucket/banners/banner1.jpg'));
      expect(dto.linkUrl, equals('/events/annual-satsang'));
      expect(dto.isActive, isTrue);
      expect(dto.sortOrder, equals(1));
    });

    test('User Profile Contract: Maps Admin / Auth user claims & profile cleanly to ProfileDto', () {
      final adminUserPayload = {
        'displayName': 'रमेश कुमार',
        'email': 'ramesh@example.com',
        'photoURL': 'https://storage.googleapis.com/test-bucket/avatars/user1.jpg',
        'role': 'mobile_user',
        'accountStatus': 'active',
        'phone': '+919876543210',
        'createdAt': Timestamp.fromDate(DateTime(2025, 1, 15)),
      };

      final doc = _FakeDocumentSnapshot('user-uid-77', adminUserPayload);
      final dto = ProfileDto.fromFirestore(doc);
      final entity = dto.toEntity();

      expect(entity.id, equals('user-uid-77'));
      expect(entity.name, equals('रमेश कुमार'));
      expect(entity.email, equals('ramesh@example.com'));
      expect(entity.phone, equals('+919876543210'));
      expect(entity.photoUrl, equals('https://storage.googleapis.com/test-bucket/avatars/user1.jpg'));
    });
  });
}
