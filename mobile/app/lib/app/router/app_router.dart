import 'package:go_router/go_router.dart';

import '../../features/home/presentation/pages/home_shell_page.dart';

final goRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomeShellPage()),
  ],
);
