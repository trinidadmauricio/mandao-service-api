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

  describe('SAAS_ADMIN role', () => {
    it('should have access to everything', () => {
      expect(hasPermission(UserRole.SAAS_ADMIN, 'dashboard', 'read')).toBe(true);
      expect(hasPermission(UserRole.SAAS_ADMIN, 'orders', 'create')).toBe(true);
      expect(hasPermission(UserRole.SAAS_ADMIN, 'units-of-measure', 'create')).toBe(true);
      expect(hasPermission(UserRole.SAAS_ADMIN, 'order-counters', 'read')).toBe(true);
      expect(canAccessResource(UserRole.SAAS_ADMIN, 'dashboard')).toBe(true);
      expect(canAccessResource(UserRole.SAAS_ADMIN, 'units-of-measure')).toBe(true);
    });
  });

  describe('SAAS_EDITOR role', () => {
    it('should have access to everything', () => {
      expect(hasPermission(UserRole.SAAS_EDITOR, 'dashboard', 'read')).toBe(true);
      expect(hasPermission(UserRole.SAAS_EDITOR, 'orders', 'create')).toBe(true);
      expect(hasPermission(UserRole.SAAS_EDITOR, 'units-of-measure', 'create')).toBe(true);
      expect(canAccessResource(UserRole.SAAS_EDITOR, 'dashboard')).toBe(true);
    });
  });

  describe('OWNER role', () => {
    it('should have access to everything except SAAS modules', () => {
      expect(hasPermission(UserRole.OWNER, 'dashboard', 'read')).toBe(true);
      expect(hasPermission(UserRole.OWNER, 'orders', 'create')).toBe(true);
      expect(hasPermission(UserRole.OWNER, 'units-of-measure', 'create')).toBe(true);
      expect(hasPermission(UserRole.OWNER, 'products', 'create')).toBe(true);
      expect(canAccessResource(UserRole.OWNER, 'dashboard')).toBe(true);
      expect(canAccessResource(UserRole.OWNER, 'units-of-measure')).toBe(true);
    });

    it('should NOT have access to SAAS modules', () => {
      expect(hasPermission(UserRole.OWNER, 'order-counters', 'read')).toBe(false);
      expect(hasPermission(UserRole.OWNER, 'payments', 'read')).toBe(false);
      expect(hasPermission(UserRole.OWNER, 'subscriptions', 'read')).toBe(false);
      expect(hasPermission(UserRole.OWNER, 'subscription-plans', 'read')).toBe(false);
      expect(canAccessResource(UserRole.OWNER, 'order-counters')).toBe(false);
      expect(canAccessResource(UserRole.OWNER, 'payments')).toBe(false);
      expect(canAccessResource(UserRole.OWNER, 'subscriptions')).toBe(false);
      expect(getAllowedActions(UserRole.OWNER, 'order-counters')).toEqual([]);
    });
  });

  describe('MERCHANT_USER role', () => {
    it('should have manage access to orders (includes read, create, update, delete)', () => {
      // MERCHANT_USER tiene 'manage' que incluye todas las acciones
      expect(hasPermission(UserRole.MERCHANT_USER, 'orders', 'manage')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'orders', 'read')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'orders', 'create')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'orders', 'update')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'orders', 'delete')).toBe(true);
    });

    it('should have access to catalog resources (products, categories, brands, branches)', () => {
      expect(hasPermission(UserRole.MERCHANT_USER, 'products', 'read')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'products', 'create')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'categories', 'read')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'brands', 'read')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'branches', 'read')).toBe(true);
    });

    it('should have access to units-of-measure', () => {
      expect(hasPermission(UserRole.MERCHANT_USER, 'units-of-measure', 'read')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'units-of-measure', 'create')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'units-of-measure', 'update')).toBe(true);
      expect(hasPermission(UserRole.MERCHANT_USER, 'units-of-measure', 'delete')).toBe(true);
      expect(canAccessResource(UserRole.MERCHANT_USER, 'units-of-measure')).toBe(true);
    });

    it('should have access to reports', () => {
      expect(hasPermission(UserRole.MERCHANT_USER, 'reports', 'read')).toBe(true);
    });

    it('should NOT have access to logistics resources', () => {
      expect(hasPermission(UserRole.MERCHANT_USER, 'drivers', 'read')).toBe(false);
      expect(hasPermission(UserRole.MERCHANT_USER, 'vehicles', 'read')).toBe(false);
      expect(hasPermission(UserRole.MERCHANT_USER, 'delivery-zones', 'read')).toBe(false);
    });
  });

  describe('LOGISTICS_PROVIDER role', () => {
    it('should have access to orders (read, update only)', () => {
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'orders', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'orders', 'update')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'orders', 'create')).toBe(false);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'orders', 'delete')).toBe(false);
    });

    it('should have access to drivers and vehicles', () => {
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'drivers', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'drivers', 'create')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'vehicles', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'vehicles', 'create')).toBe(true);
    });

    it('should have access to delivery-zones and delivery-rates', () => {
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'delivery-zones', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'delivery-zones', 'create')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'delivery-rates', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'delivery-rates', 'create')).toBe(true);
      expect(canAccessResource(UserRole.LOGISTICS_PROVIDER, 'delivery-zones')).toBe(true);
      expect(canAccessResource(UserRole.LOGISTICS_PROVIDER, 'delivery-rates')).toBe(true);
    });

    it('should have access to logistics-providers (read only - their own)', () => {
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'logistics-providers', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'logistics-providers', 'create')).toBe(false);
    });

    it('should have access to users (read, create, update)', () => {
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'users', 'read')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'users', 'create')).toBe(true);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'users', 'update')).toBe(true);
    });

    it('should NOT have access to catalog resources', () => {
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'products', 'read')).toBe(false);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'categories', 'read')).toBe(false);
      expect(hasPermission(UserRole.LOGISTICS_PROVIDER, 'units-of-measure', 'read')).toBe(false);
    });
  });

  describe('SUPERVISOR role', () => {
    it('should have access to orders (read, update only - no create/delete)', () => {
      expect(hasPermission(UserRole.SUPERVISOR, 'orders', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'orders', 'update')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'orders', 'create')).toBe(false);
      expect(hasPermission(UserRole.SUPERVISOR, 'orders', 'delete')).toBe(false);
    });

    it('should have access to drivers and vehicles', () => {
      expect(hasPermission(UserRole.SUPERVISOR, 'drivers', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'drivers', 'create')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'vehicles', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'vehicles', 'create')).toBe(true);
    });

    it('should have access to delivery-zones and delivery-rates', () => {
      expect(hasPermission(UserRole.SUPERVISOR, 'delivery-zones', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'delivery-zones', 'create')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'delivery-rates', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'delivery-rates', 'create')).toBe(true);
    });

    it('should have access to users (read, update only - no create)', () => {
      expect(hasPermission(UserRole.SUPERVISOR, 'users', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'users', 'update')).toBe(true);
      expect(hasPermission(UserRole.SUPERVISOR, 'users', 'create')).toBe(false);
    });

    it('should NOT have access to catalog resources', () => {
      expect(hasPermission(UserRole.SUPERVISOR, 'products', 'read')).toBe(false);
      expect(hasPermission(UserRole.SUPERVISOR, 'categories', 'read')).toBe(false);
      expect(hasPermission(UserRole.SUPERVISOR, 'units-of-measure', 'read')).toBe(false);
    });
  });

  describe('CUSTOMER role', () => {
    it('should only have access to orders (read, update)', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'read')).toBe(true);
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'update')).toBe(true);
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'create')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'orders', 'delete')).toBe(false);
    });

    it('should NOT have access to backoffice resources', () => {
      expect(hasPermission(UserRole.CUSTOMER, 'dashboard', 'read')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'products', 'read')).toBe(false);
      expect(hasPermission(UserRole.CUSTOMER, 'drivers', 'read')).toBe(false);
    });
  });
});

