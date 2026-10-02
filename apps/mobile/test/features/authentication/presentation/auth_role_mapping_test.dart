import 'package:flutter_test/flutter_test.dart';
import 'package:santmat_satsang_prachar/core/auth/permission_engine.dart';

void main() {
  group('createPermissionContext / custom claims mapping', () {
    test('No claims defaults to mobile_user, active, no admin permissions', () {
      final ctx = createPermissionContext(const {});

      expect(ctx.role, Role.mobileUser);
      expect(ctx.isSuspended, isFalse);
      expect(ctx.organizationId, isNull);
      expect(ctx.uid, isEmpty);

      expect(requireRole(ctx, [Role.mobileUser]).allowed, isTrue);
      expect(requireRole(ctx, [Role.clientSuperAdmin]).allowed, isFalse);
      expect(permissionEngine.hasPermission(ctx.role, 'users.manage'), isFalse);
      expect(permissionEngine.hasPermission(ctx.role, 'users.view'), isFalse);
    });

    test('Unknown role string is safely downgraded to mobile_user', () {
      final ctx = createPermissionContext(const {'role': 'hacker_king'});

      expect(ctx.role, Role.mobileUser);
      expect(requireRole(ctx, [Role.mobileUser]).allowed, isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'users.manage'), isFalse);
    });

    test('Mobile user custom claims map to self-service mobile role only', () {
      final ctx = createPermissionContext(const {
        'user_id': 'uid-1',
        'role': 'mobile_user',
        'accountStatus': 'active',
      });

      expect(ctx.role, Role.mobileUser);
      expect(ctx.uid, 'uid-1');
      expect(ctx.isSuspended, isFalse);
      expect(requireRole(ctx, [Role.mobileUser]).allowed, isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'users.manage'), isFalse);
      expect(permissionEngine.hasPermission(ctx.role, 'users.view'), isFalse);
    });

    test('client_super_admin claims unlock user management permissions', () {
      final ctx = createPermissionContext(const {
        'user_id': 'uid-2',
        'role': 'client_super_admin',
        'accountStatus': 'active',
      });

      expect(ctx.role, Role.clientSuperAdmin);
      expect(ctx.isSuspended, isFalse);
      expect(requireRole(ctx, [Role.clientSuperAdmin]).allowed, isTrue);
      expect(requireRole(ctx, [Role.mobileUser]).allowed, isFalse);
      expect(permissionEngine.hasPermission(ctx.role, 'users.manage'), isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'users.view'), isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'users.assign_role'), isTrue);
    });

    test('developer_super_admin is the highest privilege role', () {
      final ctx = createPermissionContext(const {
        'user_id': 'uid-3',
        'role': 'developer_super_admin',
        'accountStatus': 'active',
      });

      expect(ctx.role, Role.developerSuperAdmin);
      expect(requireRole(ctx, [Role.developerSuperAdmin]).allowed, isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'users.manage'), isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'platform.security'), isTrue);
      expect(permissionEngine.hasPermission(ctx.role, 'rbac.manage'), isTrue);
    });

    test('accountStatus=suspended blocks role checks regardless of role', () {
      final suspendedMobile = createPermissionContext(const {
        'user_id': 'uid-4',
        'role': 'mobile_user',
        'accountStatus': 'suspended',
      });
      final suspendedAdmin = createPermissionContext(const {
        'user_id': 'uid-5',
        'role': 'client_super_admin',
        'accountStatus': 'suspended',
      });

      expect(suspendedMobile.isSuspended, isTrue);
      expect(suspendedAdmin.isSuspended, isTrue);

      expect(requireRole(suspendedMobile, [Role.mobileUser]).allowed, isFalse);
      expect(requireRole(suspendedAdmin, [Role.clientSuperAdmin]).allowed, isFalse);
    });

    test('Default (absent accountStatus) resolves to active', () {
      final ctx = createPermissionContext(const {
        'user_id': 'uid-6',
        'role': 'mobile_user',
      });

      expect(ctx.isSuspended, isFalse);
      expect(requireRole(ctx, [Role.mobileUser]).allowed, isTrue);
    });

    test('Hierarchy: developer_super_admin can manage any lower role', () {
      expect(
        Role.developerSuperAdmin.canManage(Role.clientSuperAdmin),
        isTrue,
      );
      expect(
        Role.developerSuperAdmin.canManage(Role.mobileUser),
        isTrue,
      );
      expect(Role.clientSuperAdmin.canManage(Role.mobileUser), isTrue);
      expect(Role.mobileUser.canManage(Role.mobileUser), isFalse);
    });
  });
}