import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/utils/result.dart';
import 'package:santmat_satsang_prachar/features/home/domain/entities/home_dashboard_entity.dart';
import 'package:santmat_satsang_prachar/features/home/domain/usecases/home_usecases.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/pages/home_page.dart';
import 'package:santmat_satsang_prachar/l10n/gen/app_localizations.dart';
import 'package:santmat_satsang_prachar/core/di/data_providers.dart';
import 'package:santmat_satsang_prachar/features/home/presentation/providers/home_providers.dart';
import '../../../../helpers/mock_home_data_source.dart';

class MockGetHomeDashboardUseCase extends GetHomeDashboardUseCase {
  MockGetHomeDashboardUseCase(super.repository);

  @override
  Future<Result<HomeDashboardEntity>> call() async {
    return const Result.success(
      HomeDashboardEntity(
        notificationCount: 0,
        banners: [],
        quickActions: [],
        latestSatsangs: [],
        upcomingEvents: [],
        latestAudios: [],
        featuredBooks: [],
      ),
    );
  }
}

void main() {
  testWidgets('HomePage renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          homeDataSourceProvider.overrideWithValue(MockHomeDataSource()),
          getHomeDashboardUseCaseProvider.overrideWith(
            (ref) =>
                MockGetHomeDashboardUseCase(ref.read(homeRepositoryProvider)),
          ),
        ],
        child: const MaterialApp(
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
          home: HomePage(),
        ),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.byType(HomePage), findsOneWidget);
  });
}

