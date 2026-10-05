/// Canonical route hierarchy for the mobile app (PHASE 2).
///
/// This is the single source of truth used by the back-navigation policy,
/// the debug navigation logger and the navigation regression tests.
///
/// It is derived strictly from the routes that are actually registered in
/// `lib/app/router/app_router.dart`. No routes are invented here.
///
/// Shape of the app:
///
///   ROOT
///   └── `/`  (HOME, shell branch 0)
///
///   SHELL BRANCHES (bottom navigation)
///   ├── `/audio`          (branch 1)
///   ├── `/satsang`        (branch 2 — Stuti-Vinati)
///   ├── `/notifications`  (branch 3)
///   └── `/settings`       (branch 4 — Profile)
///
///   TOP-LEVEL SECONDARY (pushed above the shell, Back resolves to HOME)
///   ├── `/search`            Search
///   ├── `/profile/favorites`  Favorites
///   ├── `/events`            Events
///   ├── `/donations`         Donations
///   └── `/library`           Library
///
///   NESTED CHILD (Back resolves to the logical parent that is physically
///   on the stack, which makes the destination origin-aware by construction)
///   ├── `/profile/edit`, `/profile/account`, `/profile/history`  → Profile
///   ├── `/satsang/category/:id`, `/satsang/details/:id`         → Stuti
///   ├── `/audio/details/:id` (Player), `/audio/now-playing`,
///   │   `/audio/bhajans`, `/audio/category/:id`                 → Audio
///   ├── `/books/details/:id`, `/books/reader`, `/books/category/:id`,
///   │   `/books/bookmarks`, `/books/history`
///   ├── `/events/*`                                             → Events
///   ├── `/notifications/details`, `/notifications/settings`      → Notifications
///   ├── `/donations/*`                                          → Donations
///   ├── `/library/*`                                            → Library
///   └── `/settings/*`                                           → Profile
library;

/// How a location participates in the back-navigation contract.
enum SspRouteKind {
  /// The root Home location. Back here is the double-back-to-exit flow.
  root,

  /// A bottom-navigation branch root. Back returns to Home.
  shellTab,

  /// A top-level secondary user page. Back returns to Home.
  topLevel,

  /// A child/detail page. Back returns to the logical parent.
  nested,

  /// A public authentication/onboarding location.
  auth,

  /// Anything the router could not classify.
  unknown,
}

/// The single root location of the signed-in application.
const String kSspRootPath = '/';

/// Branch index of Home inside `StatefulShellRoute.indexedStack`.
const int kSspHomeBranch = 0;

/// Branch index of Audio.
const int kSspAudioBranch = 1;

/// Branch index of Stuti-Vinati.
const int kSspStutiBranch = 2;

/// Branch index of Notifications.
const int kSspNotificationsBranch = 3;

/// Branch index of Profile.
const int kSspProfileBranch = 4;

/// Branch roots of the app shell, mapped to their branch index.
const Map<String, int> kSspShellBranches = <String, int>{
  kSspRootPath: kSspHomeBranch,
  '/audio': kSspAudioBranch,
  '/satsang': kSspStutiBranch,
  '/notifications': kSspNotificationsBranch,
  '/settings': kSspProfileBranch,
};

/// Public authentication / onboarding locations.
const Set<String> kSspAuthPaths = <String>{
  '/splash',
  '/onboarding',
  '/login',
  '/register',
};

/// Top-level secondary user pages. Back on these resolves to Home.
const Set<String> kSspTopLevelPaths = <String>{
  '/search',
  '/profile/favorites',
  '/events',
  '/donations',
  '/library',
};

/// Nested child locations mapped to their logical parent location.
///
/// Patterns use the same `:param` convention as the router. A `null` parent
/// means the location has no registered parent page; Back then simply pops the
/// real stack, which keeps the behaviour deterministic and never exits the app.
const Map<String, String?> kSspNestedParents = <String, String?>{
  // Profile children
  '/profile/edit': '/settings',
  '/profile/account': '/settings',
  '/profile/history': '/settings',

  // Stuti-Vinati children
  '/satsang/category/:id': '/satsang',
  '/satsang/details/:id': '/satsang',

  // Audio children
  '/audio/details/:id': '/audio',
  '/audio/now-playing': '/audio/details/:id',
  '/audio/bhajans': '/audio',
  '/audio/category/:id': '/audio',

  // Books children
  '/books/details/:id': null,
  '/books/reader': '/books/details/:id',
  '/books/category/:id': null,
  '/books/bookmarks': null,
  '/books/history': null,

  // Events children
  '/events/details/:id': '/events',
  '/events/my-events': '/events',
  '/events/register/:id': '/events/details/:id',

  // Notifications children
  '/notifications/details': '/notifications',
  '/notifications/settings': '/notifications',

  // Donations children
  '/donations/details/:id': '/donations',
  '/donations/checkout/:id': '/donations/details/:id',
  '/donations/history': '/donations',
  '/donations/receipt/:id': '/donations',

  // Library children
  '/library/bookmarks': '/library',
  '/library/favorites': '/library',
  '/library/history': '/library',
  '/library/recent': '/library',

  // Preferences children
  '/settings/appearance': '/settings',
  '/settings/accessibility': '/settings',
  '/settings/notifications': '/settings',
  '/settings/privacy': '/settings',
  '/settings/playback': '/settings',
  '/settings/reading': '/settings',
};

/// Locations that present the audio player. Used to avoid stacking the player
/// on top of itself when the mini player is tapped from a player page.
const Set<String> kSspPlayerRoutes = <String>{
  '/audio/details/:id',
  '/audio/now-playing',
};

/// Classification result for a single location.
class SspRouteInfo {
  const SspRouteInfo({
    required this.location,
    required this.kind,
    this.branchIndex,
    this.parentPattern,
  });

  final String location;
  final SspRouteKind kind;

  /// Branch index when [kind] is [SspRouteKind.shellTab].
  final int? branchIndex;

  /// The registered parent pattern when [kind] is [SspRouteKind.nested].
  final String? parentPattern;

  bool get isRoot => kind == SspRouteKind.root;
  bool get isShellTab => kind == SspRouteKind.shellTab;
  bool get isTopLevel => kind == SspRouteKind.topLevel;
  bool get isNested => kind == SspRouteKind.nested;
  bool get isAuth => kind == SspRouteKind.auth;

  /// True when this location renders the audio player.
  bool get isPlayer => kSspPlayerPatterns.any((p) => _matches(p, location));

  /// True when Back from this location must land on Home rather than on a
  /// tab that happened to be active when the page was opened.
  bool get resolvesBackToHome =>
      kind == SspRouteKind.root || kind == SspRouteKind.topLevel;

  @override
  String toString() =>
      'SspRouteInfo($location, ${kind.name}, branch=$branchIndex, '
      'parent=$parentPattern)';
}

const List<String> kSspPlayerPatterns = <String>[
  '/audio/details/:id',
  '/audio/now-playing',
];

/// Strips a query string / fragment and any trailing slash.
String normalizeSspPath(String? rawPath) {
  var path = rawPath ?? kSspRootPath;
  final cut = path.indexOf(RegExp(r'[?#]'));
  if (cut != -1) path = path.substring(0, cut);
  if (path.isEmpty) return kSspRootPath;
  while (path.length > 1 && path.endsWith('/')) {
    path = path.substring(0, path.length - 1);
  }
  return path;
}

/// Matches a concrete [path] against a router pattern containing `:params`.
bool _matches(String pattern, String path) {
  final patternParts = pattern.split('/');
  final pathParts = path.split('/');
  if (patternParts.length != pathParts.length) return false;
  for (var i = 0; i < patternParts.length; i++) {
    final p = patternParts[i];
    if (p.startsWith(':')) continue;
    if (p != pathParts[i]) return false;
  }
  return true;
}

/// Classifies [rawPath] against the canonical hierarchy.
SspRouteInfo classifySspRoute(String? rawPath) {
  final path = normalizeSspPath(rawPath);

  if (kSspAuthPaths.contains(path)) {
    return SspRouteInfo(location: path, kind: SspRouteKind.auth);
  }

  if (path == kSspRootPath) {
    return SspRouteInfo(
      location: path,
      kind: SspRouteKind.root,
      branchIndex: kSspHomeBranch,
    );
  }

  final branch = kSspShellBranches[path];
  if (branch != null) {
    return SspRouteInfo(
      location: path,
      kind: SspRouteKind.shellTab,
      branchIndex: branch,
    );
  }

  if (kSspTopLevelPaths.contains(path)) {
    return SspRouteInfo(location: path, kind: SspRouteKind.topLevel);
  }

  for (final entry in kSspNestedParents.entries) {
    if (_matches(entry.key, path)) {
      return SspRouteInfo(
        location: path,
        kind: SspRouteKind.nested,
        parentPattern: entry.value,
      );
    }
  }

  return SspRouteInfo(location: path, kind: SspRouteKind.unknown);
}

/// True when [path] currently renders the audio player.
bool isSspPlayerPath(String? path) {
  final normalized = normalizeSspPath(path);
  return kSspPlayerPatterns.any((p) => _matches(p, normalized));
}
