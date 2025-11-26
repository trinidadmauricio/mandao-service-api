/**
 * Tests unitarios para el sistema de permisos
 */

import { UserRole, hasPermission, canAccessResource, getAllowedActions, ROLE_PERMISSIONS } from '../../permissions';

describe('Permissions System', () => {
  describe('DRIVER role', () => {
    it('should have no permissions in backoffice', () => {
      const driverPermissions = ROLE_PERMISSIONS[UserRole.DRIVER];
      expect(driverPermissions).toEqual([]);
    });

    it('should not have permission to access any resource', () => {
      expect(hasPermission(UserRole.DRIVER, 'dashboard', 'read')).toBe(false);
      expect(hasPermission(UserRole.DRIVER, 'orders', 'read')).toBe(false);
      expect(hasPermission(UserRole.DRIVER, 'drivers', 'read')).toBe(false);
    });

    it('should not be able to access any resource', () => {
      expect(canAccessResource(UserRole.DRIVER, 'dashboard')).toBe(false);
      expect(canAccessResource(UserRole.DRIVER, 'orders')).toBe(false);
      expect(canAccessResource(UserRole.DRIVER, 'drivers')).toBe(false);
    });

    it('should have no allowed actions for any resource', () => {
      expect(getAllowedActions(UserRole.DRIVER, 'dashboard')).toEqual([]);
      expect(getAllowedActions(UserRole.DRIVER, 'orders')).toEqual([]);
      expect(getAllowedActions(UserRole.DRIVER, 'drivers')).toEqual([]);
    });
  });

  describe('Other roles still work', () => {
    it('should allow SAAS_ADMIN to access everything', () => {
      expect(hasPermission(UserRole.SAAS_ADMIN, 'dashboard', 'read')).toBe(true);
      expect(hasPermission(UserRole.SAAS_ADMIN, 'orders', 'create')).toBe(true);
      expect(canAccessResource(UserRole.SAAS_ADMIN, 'dashboard')).toBe(true);
    });

    it('should allow OWNER to access everything', () => {
      expect(hasPermission(UserRole.OWNER, 'dashboard', 'read')).toBe(true);
      expect(hasPermission(UserRole.OWNER, 'orders', 'create')).toBe(true);
      expect(canAccessResource(UserRole.OWNER, 'dashboard')).toBe(true);
    });
  });
});

