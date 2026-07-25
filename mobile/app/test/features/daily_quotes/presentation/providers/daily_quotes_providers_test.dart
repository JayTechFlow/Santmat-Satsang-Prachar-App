import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/presentation/providers/daily_quotes_providers.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/data/datasources/mock_daily_quote_data_source.dart';

void main() {
  test('DailyQuotesNotifier loads data correctly', () async {
    final container = ProviderContainer(
      overrides: [
        mockDailyQuoteDataSourceProvider.overrideWithValue(
          MockDailyQuoteDataSource(),
        ),
      ],
    );
    addTearDown(container.dispose);

    var state = container.read(dailyQuotesProvider);
    expect(state.isLoading, true);

    await container.read(dailyQuotesProvider.notifier).loadData();
    state = container.read(dailyQuotesProvider);

    expect(state.isLoading, false);
    expect(state.error, isNull);
    expect(state.todayQuote, isNotNull);
    expect(state.featuredQuotes, isNotEmpty);
  });
}
