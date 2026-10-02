import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_guard.dart';
import 'package:santmat_satsang_prachar/core/config/dev_entry_config.dart';

void main() {
  group('Strict Android Mobile / Web Admin Separation Regression Protection', () {
    test('Route permission map contains zero admin/developer routes', () {
      final routes = routePermissionMap.keys.toList();

      for (final route in routes) {
        expect(
          route.startsWith('/admin'),
          isFalse,
          reason: 'Mobile app must not declare any /admin routes: $route',
        );
        expect(
          route.startsWith('/developer'),
          isFalse,
          reason: 'Mobile app must not declare any /developer routes: $route',
        );
        expect(
          route.startsWith('/management'),
          isFalse,
          reason: 'Mobile app must not declare any /management routes: $route',
        );
      }
    });

    test('All mobile routes in permission map allow Role.mobileUser', () {
      for (final entry in routePermissionMap.entries) {
        final config = entry.value;
        if (config.allowedRoles.isNotEmpty) {
          expect(
            config.allowedRoles.contains(Role.mobileUser),
            isTrue,
            reason: 'Mobile route ${entry.key} must be accessible to Role.mobileUser',
          );
        }
      }
    });

    test('DevEntryConfig is strictly configured as mobile_user with no admin permissions', () {
      final context = DevEntryConfig.devPermissionContext;

      expect(context.role, equals(Role.mobileUser));
      expect(
        context.customClaims?['permissions']?.contains('users.manage'),
        isFalse,
      );
      expect(
        context.customClaims?['permissions']?.contains('audio.manage'),
        isFalse,
      );
      expect(
        context.customClaims?['permissions']?.contains('settings.manage'),
        isFalse,
      );
      expect(
        context.customClaims?['permissions']?.contains('rbac.manage'),
        isFalse,
      );
    });

    test('Mobile user has zero admin permissions via PermissionEngine', () {
      const adminPermissions = [
        'users.manage',
        'users.delete',
        'users.assign_role',
        'audio.upload',
        'audio.delete',
        'audio.publish',
        'audio.manage',
        'books.upload',
        'books.delete',
        'books.publish',
        'books.manage',
        'banners.upload',
        'banners.delete',
        'banners.manage',
        'stuti.upload',
        'stuti.delete',
        'stuti.publish',
        'stuti.manage',
        'categories.manage',
        'events.create',
        'events.delete',
        'events.manage',
        'notifications.broadcast',
        'notifications.manage',
        'playlists.create',
        'playlists.manage',
        'platform.config',
        'platform.settings',
        'platform.security',
        'platform.rbac',
        'rbac.manage',
      ];

      for (final perm in adminPermissions) {
        final hasPerm = permissionEngine.hasPermission(Role.mobileUser, perm);
        expect(
          hasPerm,
          isFalse,
          reason: 'Role.mobileUser must never have admin permission: $perm',
        );
      }
    });

    test('Mobile user has all required mobile application permissions', () {
      const mobilePermissions = [
        'mobile.profile',
        'mobile.search',
        'mobile.library',
        'mobile.audio',
        'mobile.books',
        'mobile.stuti',
        'mobile.notifications',
        'mobile.bookmarks',
        'mobile.favorites',
        'mobile.history',
        'mobile.recommendations',
        'mobile.playlists',
        'mobile.downloads',
        'mobile.settings',
      ];

      for (final perm in mobilePermissions) {
        final hasPerm = permissionEngine.hasPermission(Role.mobileUser, perm);
        expect(
          hasPerm,
          isTrue,
          reason: 'Role.mobileUser must have mobile permission: $perm',
        );
      }
    });
  });
}
