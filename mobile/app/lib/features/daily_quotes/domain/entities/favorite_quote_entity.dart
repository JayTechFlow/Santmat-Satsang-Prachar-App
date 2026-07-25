import 'daily_quote_entity.dart';

class FavoriteQuoteEntity {
  final DailyQuoteEntity quote;
  final DateTime favoritedAt;

  const FavoriteQuoteEntity({required this.quote, required this.favoritedAt});
}
