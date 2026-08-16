import 'daily_quote_entity.dart';

class QuoteHistoryEntity {
  final DailyQuoteEntity quote;
  final DateTime viewedAt;

  const QuoteHistoryEntity({required this.quote, required this.viewedAt});
}
