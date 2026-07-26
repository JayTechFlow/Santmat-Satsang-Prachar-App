import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/sync/conflict/conflict_resolver.dart';
import 'package:santmat_satsang_prachar/core/sync/conflict/conflict_resolution_strategy.dart';

void main() {
  test('ConflictResolver uses serverWins correctly', () {
    final resolver = ConflictResolver(
      defaultStrategy: ConflictResolutionStrategy.serverWins,
    );
    final clientData = {'a': 1};
    final serverData = {'a': 2};

    final result = resolver.resolve(
      clientData: clientData,
      serverData: serverData,
    );
    expect(result['a'], 2);
  });
}
