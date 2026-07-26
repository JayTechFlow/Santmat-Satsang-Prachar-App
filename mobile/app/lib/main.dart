import 'app/app.dart';
import 'bootstrap/bootstrap.dart';

void main() async {
  await bootstrap(() => const App());
}
