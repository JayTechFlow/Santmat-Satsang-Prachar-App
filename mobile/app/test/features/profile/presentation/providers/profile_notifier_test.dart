import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/profile/presentation/providers/profile_providers.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/usecases/profile_usecases.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_profile_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_preference_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/user_statistics_entity.dart';
import 'package:santmat_satsang_prachar/features/profile/domain/entities/account_information_entity.dart';

class FakeGetProfileUseCase implements GetProfileUseCase {
  @override
  Future<Result<UserProfileEntity>> call() async {
    return Result.success(
      UserProfileEntity(
        id: '123',
        name: 'John',
        statistics: const UserStatisticsEntity(
          downloadCount: 0,
          favoriteCount: 0,
          bookmarkCount: 0,
          totalListeningTime: Duration.zero,
          readingProgressPercentage: 0,
        ),
        preferences: const UserPreferenceEntity(
          languageCode: 'en',
          themeMode: 'system',
          notificationsEnabled: true,
        ),
        accountInfo: AccountInformationEntity(
          memberSince: DateTime.now(),
          applicationVersion: '1.0.0',
        ),
      ),
    );
  }
}

void main() {
  test('ProfileNotifier initializes with loading and then data', () async {
    final container = ProviderContainer(
      overrides: [
        getProfileUseCaseProvider.overrideWithValue(FakeGetProfileUseCase()),
      ],
    );
    addTearDown(container.dispose);

    final initial = container.read(profileStateProvider);
    expect(initial.isLoading, true);

    await container.read(profileStateProvider.notifier).loadProfile();
    final data = container.read(profileStateProvider);
    expect(data.hasValue, true);
    expect(data.value?.name, 'John');
  });
}
