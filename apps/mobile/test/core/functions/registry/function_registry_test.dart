import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/functions/registry/function_registry.dart';

void main() {
  test('FunctionRegistry contains valid endpoints', () {
    expect(FunctionRegistry.getProfile, 'profile-getProfile');
  });
}
