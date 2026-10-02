import 'package:flutter/material.dart';

/// The application's single root navigator key.
///
/// Lives in `core/navigation` so both the router and the navigation policy can
/// reach it without depending on the router file itself.
final GlobalKey<NavigatorState> rootNavigatorKey =
    GlobalKey<NavigatorState>(debugLabel: 'sspRootNavigator');

/// Number of pages currently held by the root navigator.
///
/// * `1` means only the app shell is present — this is the only state in which
///   a Back press is allowed to terminate the application.
/// * `> 1` means at least one page was pushed above the shell, so Back must
///   resolve to that page's logical parent and must never exit the app.
int rootStackDepth() => rootNavigatorKey.currentState?.widget.pages.length ?? 0;
