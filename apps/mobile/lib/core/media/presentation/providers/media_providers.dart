import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/media/data/datasources/media_remote_datasource.dart';
import 'package:santmat_satsang_prachar/core/media/data/repositories/media_repository_impl.dart';
import 'package:santmat_satsang_prachar/core/media/domain/entities/media_asset.dart';
import 'package:santmat_satsang_prachar/core/media/domain/repositories/i_media_repository.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/image_size_config.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_category.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_status.dart';
import 'package:santmat_satsang_prachar/core/media/domain/value_objects/media_type.dart';
import 'package:santmat_satsang_prachar/core/storage/offline/offline_media_service.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_analytics_service.dart';
import 'package:santmat_satsang_prachar/core/analytics/playback_session_reporter.dart';
import 'package:santmat_satsang_prachar/core/storage/storage_service.dart';

final mediaRemoteDataSourceProvider = Provider<IMediaRemoteDataSource>((ref) {
  return FirestoreMediaDataSource(firestore: FirebaseFirestore.instance);
});

/// Validated server-tunable image dimensions. Falls back to the controlled
/// defaults when remote config is unavailable (e.g. in tests or offline).
final imageSizeConfigProvider = FutureProvider<ImageSizeConfig>((ref) async {
  final rc = ref.watch(remoteConfigServiceProvider);
  try {
    return ImageSizeConfig.validated(
      artworkSize: rc.getInt(ImageSizeConfigKeys.artworkSize),
      iconSize: rc.getInt(ImageSizeConfigKeys.iconSize),
      bannerWidth: rc.getInt(ImageSizeConfigKeys.bannerWidth),
      bannerHeight: rc.getInt(ImageSizeConfigKeys.bannerHeight),
    );
  } catch (_) {
    return ImageSizeConfig.defaults;
  }
});

final mediaRepositoryProvider = Provider<IMediaRepository>((ref) {
  return MediaRepositoryImpl(ref.watch(mediaRemoteDataSourceProvider));
});

final playbackSessionReporterProvider = Provider<PlaybackSessionReporter>((ref) {
  return PlaybackSessionReporter();
});

final playbackAnalyticsServiceProvider = Provider<PlaybackAnalyticsService>((ref) {
  return PlaybackAnalyticsService(
    ref.watch(firebaseAnalyticsServiceProvider),
    sessionReporter: ref.watch(playbackSessionReporterProvider),
  );
});

final offlineMediaServiceProvider = Provider<OfflineMediaService>((ref) {
  return OfflineMediaService(
    urlResolver: ref.watch(mediaUrlResolverProvider),
    prefs: ref.watch(sharedPreferencesProvider),
    analyticsService: ref.watch(playbackAnalyticsServiceProvider),
  );
});

final mediaAssetDetailProvider = FutureProvider.family<MediaAsset, String>((ref, id) async {
  final repo = ref.watch(mediaRepositoryProvider);
  final result = await repo.getById(id);
  if (result.isError) throw Exception(result.error);
  return result.data!;
});

final mediaAssetsListProvider = FutureProvider.family<List<MediaAsset>, ({
  MediaType? type,
  MediaCategory? category,
  MediaStatus? status,
  String? linkedEntityId,
  int? limit,
})>((ref, filter) async {
  final repo = ref.watch(mediaRepositoryProvider);
  final result = await repo.getAll(
    type: filter.type,
    category: filter.category,
    status: filter.status,
    linkedEntityId: filter.linkedEntityId,
    limit: filter.limit,
  );
  if (result.isError) throw Exception(result.error);
  return result.data!;
});

final resolvedMediaUrlProvider = FutureProvider.family<String, String>((ref, path) async {
  final resolver = ref.watch(mediaUrlResolverProvider);
  return await resolver.resolveDownloadUrl(path);
});
