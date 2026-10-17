import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:just_audio/just_audio.dart';

import 'package:santmat_satsang_prachar/core/di/dependency_injection.dart';
import 'package:santmat_satsang_prachar/core/firebase/firestore_collections.dart';
import 'package:santmat_satsang_prachar/core/services/firestore_service.dart';
import 'package:santmat_satsang_prachar/core/storage/providers/firebase_storage_provider.dart';
import 'package:santmat_satsang_prachar/core/storage/resolvers/media_url_resolver.dart';
import 'package:santmat_satsang_prachar/core/storage/storage_service.dart';
import 'package:santmat_satsang_prachar/features/audio/data/datasources/firestore_audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/data/models/audio_dto.dart';
import 'package:santmat_satsang_prachar/features/search/domain/entities/search_category_definition.dart';
import 'package:santmat_satsang_prachar/features/search/domain/utils/search_text_utils.dart';
import 'package:santmat_satsang_prachar/firebase_options.dart';

/// Runtime verification of the production bhajan catalogue on a real device.
///
/// Regression guard for the Admin-vs-app mismatch where a hard `limit(10)`
/// hid every published track past the newest ten.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    } catch (_) {}
    await StorageService.init();
    await DependencyInjection.init();
  });

  testWidgets(
    'RC01: repository returns every published track across all pages',
    (tester) async {
      final source = FirestoreAudioDataSource(FirestoreService());

      // Independent, un-paginated count of every published document.
      final rawSnapshot = await FirestoreService().queryCollection(
        FirestoreCollections.audio,
        (ref) => ref.where('status', isEqualTo: 'प्रकाशित'),
      );
      final rawPublished = rawSnapshot.docs
          .map((d) => AudioDto.fromFirestore(d).toEntity())
          .toList();

      final repositoryCatalogue = await source.getLatestAudio();

      debugPrint('RC01 raw published docs      : ${rawPublished.length}');
      debugPrint('RC01 repository catalogue    : ${repositoryCatalogue.length}');

      // The defect: only the newest 10 were ever returned.
      expect(repositoryCatalogue.length, greaterThan(10));
      // Complete retrieval: pagination must not drop a single published doc.
      expect(repositoryCatalogue.length, equals(rawPublished.length));
      expect(
        repositoryCatalogue.map((a) => a.id).toSet().length,
        equals(rawPublished.length),
      );

      // Every catalogue entry must be playable: non-empty audio URL.
      final withoutAudio = repositoryCatalogue
          .where((a) => a.audioUrl.trim().isEmpty)
          .toList();
      debugPrint('RC01 tracks missing audioUrl : ${withoutAudio.length}');
      expect(withoutAudio, isEmpty);
    },
  );

  testWidgets(
    'RC02: category filters resolve the same songs as the raw dataset',
    (tester) async {
      final source = FirestoreAudioDataSource(FirestoreService());
      final rawSnapshot = await FirestoreService().queryCollection(
        FirestoreCollections.audio,
        (ref) => ref.where('status', isEqualTo: 'प्रकाशित'),
      );
      final rawPublished = rawSnapshot.docs
          .map((d) => AudioDto.fromFirestore(d).toEntity())
          .toList();
      final repositoryCatalogue = await source.getLatestAudio();

      for (final category in SearchCategories.all.where((c) => !c.isAllSentinel)) {
        final fromRaw = rawPublished
            .where((a) => matchesAudioSearch(a, '', category))
            .length;
        final fromRepository = repositoryCatalogue
            .where((a) => matchesAudioSearch(a, '', category))
            .length;
        debugPrint(
          'RC02 ${category.uiLabel}: raw=$fromRaw repository=$fromRepository',
        );
        expect(
          fromRepository,
          equals(fromRaw),
          reason: '${category.uiLabel} must not lose tracks after pagination',
        );
      }

      // सभी भजन is the aggregate: it must still reach every published track,
      // including legacy/unclassified ones, while the named categories never
      // surface those legacy tracks.
      final allFromRepository = repositoryCatalogue
          .where((a) => matchesAudioSearch(a, '', SearchCategories.allBhajan))
          .length;
      debugPrint('RC02 सभी भजन aggregate       : $allFromRepository');
      expect(allFromRepository, equals(rawPublished.length));

      final legacyTracks = rawPublished
          .where(
            (a) =>
                a.category.name.toLowerCase() == '' ||
                a.category.id.toLowerCase() == '',
          )
          .toList();
      debugPrint('RC02 legacy general tracks   : ${legacyTracks.length}');
      for (final legacy in legacyTracks) {
        expect(
          repositoryCatalogue.any((a) => a.id == legacy.id),
          isTrue,
          reason: 'legacy track must stay in the aggregate',
        );
        for (final category
            in SearchCategories.all.where((c) => !c.isAllSentinel)) {
          expect(
            matchesAudioSearch(legacy, '', category),
            isFalse,
            reason: 'legacy track must not appear in ${category.uiLabel}',
          );
        }
      }
    },
  );

  testWidgets(
    'RC04: mobile category model is exactly the four permanent categories',
    (tester) async {
      final source = FirestoreAudioDataSource(FirestoreService());
      final categories = await source.getCategories();

      expect(
        categories.map((c) => c.id).toList(),
        <String>[
          'allBhajan',
          'shahiBhajanavali',
          'padavaliBhajan',
          'swagatGeet',
        ],
      );
      expect(
        categories.map((c) => c.name).toList(),
        <String>['सभी भजन', 'शाही भजनावली', 'पदावली भजन', 'स्वागत गीत'],
      );
      expect(
        categories.map((c) => c.name.toLowerCase()),
        isNot(contains('general')),
      );
    },
  );

  testWidgets('RC03: first catalogue track resolves to a playable URL', (
    tester,
  ) async {
    final source = FirestoreAudioDataSource(FirestoreService());
    final catalogue = await source.getLatestAudio();
    expect(catalogue, isNotEmpty);

    final first = catalogue.first;
    final resolver = MediaUrlResolver(FirebaseStorageProvider());
    final resolved = await resolver.resolveDownloadUrl(first.audioUrl);
    debugPrint('RC03 first track             : ${first.title}');
    debugPrint('RC03 resolved url non-empty  : ${resolved.isNotEmpty}');

    expect(resolved.isNotEmpty, isTrue);
    expect(resolved, contains('firebasestorage.googleapis.com'));

    final player = AudioPlayer();
    addTearDown(player.dispose);
    await player.setAudioSource(AudioSource.uri(Uri.parse(resolved)));
    debugPrint('RC03 player duration         : ${player.duration}');
  });
}
