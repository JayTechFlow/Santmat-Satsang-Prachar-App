import 'package:flutter_test/flutter_test.dart';
import '../../../../helpers/mock_daily_quote_data_source.dart';
import 'package:santmat_satsang_prachar/features/daily_quotes/data/repositories/daily_quote_repository_impl.dart';

void main() {
  late MockDailyQuoteDataSource dataSource;
  late DailyQuoteRepositoryImpl repository;

  setUp(() {
    dataSource = MockDailyQuoteDataSource();
    repository = DailyQuoteRepositoryImpl(dataSource);
  });

  test('getFeaturedQuotes returns Result.success', () async {
    final result = await repository.getFeaturedQuotes();
    expect(result.isSuccess, true);
    expect(result.data, isNotEmpty);
  });

  test('getTodayQuote returns Result.success', () async {
    final result = await repository.getTodayQuote();
    expect(result.isSuccess, true);
    expect(result.data, isNotNull);
  });
}
