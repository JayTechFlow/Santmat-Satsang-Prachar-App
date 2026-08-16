import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_audio_data_source.dart';
import 'package:santmat_satsang_prachar/features/audio/data/repositories/audio_repository_impl.dart';

void main() {
  late MockAudioDataSource dataSource;
  late AudioRepositoryImpl repository;

  setUp(() {
    dataSource = MockAudioDataSource();
    repository = AudioRepositoryImpl(dataSource);
  });

  test('getLatestAudio returns Result.success', () async {
    final result = await repository.getLatestAudio();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getFeaturedAudio returns Result.success', () async {
    final result = await repository.getFeaturedAudio();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getPopularAudio returns Result.success', () async {
    final result = await repository.getPopularAudio();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });
}
