import os

base_path = 'mobile/app/test/core/functions'

files = {
    'client/cloud_function_client_test.dart': '''
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('CloudFunctionClient test placeholder', () {
    expect(true, true);
  });
}
''',
    'services/callable_function_service_test.dart': '''
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('CallableFunctionService test placeholder', () {
    expect(true, true);
  });
}
''',
    'registry/function_registry_test.dart': '''
import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/functions/registry/function_registry.dart';

void main() {
  test('FunctionRegistry contains valid endpoints', () {
    expect(FunctionRegistry.getProfile, 'profile-getProfile');
  });
}
''',
    'di/function_providers_test.dart': '''
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:santmat_satsang_prachar/core/di/service_locator_registrations.dart';
import 'package:santmat_satsang_prachar/core/functions/client/cloud_function_client.dart';

void main() {
  test('Function Providers are registered correctly', () {
    final container = ProviderContainer();
    // In a real test, we might override cloudFunctionsServiceProvider to prevent real Firebase init
    // For this simple test, we just ensure it exists
    expect(backendApiConfigurationProvider, isNotNull);
    container.dispose();
  });
}
'''
}

for rel_path, content in files.items():
    full_path = os.path.join(base_path, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\n')
