import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'back_navigation_controller.dart';

/// The single place where the Android system Back button is intercepted.
///
/// It is installed exactly once, on the app shell, which is the only route of
/// the root navigator. Without it, every Back press at a bottom-navigation tab
/// bubbles out of every navigator, `Navigator.maybePop` returns `false` and the
/// framework calls `SystemNavigator.pop()` — which closes the app.
///
/// `canPop: false` makes the enclosing route report `RoutePopDisposition
/// .doNotPop`, so the press is consumed here and forwarded to the one canonical
/// [BackNavigationController]. Pages pushed above the shell keep their natural
/// pop behaviour, which already resolves to their logical parent.
class CanonicalBackHandler extends ConsumerWidget {
  const CanonicalBackHandler({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopScope<Object?>(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        ref
            .read(backNavigationControllerProvider)
            .handleBack(context, source: BackSource.system);
      },
      child: child,
    );
  }
}
