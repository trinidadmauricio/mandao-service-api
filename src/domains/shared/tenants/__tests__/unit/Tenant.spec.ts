/**
 * Tests unitarios para Tenant entity
 */

import { Tenant } from '../../domain/entities/Tenant';

describe('Tenant Entity', () => {
  describe('isActive', () => {
    it('should return true for ACTIVE status', () => {
      const tenant = new Tenant(
        'id',
        'slug',
        'name',
        'RETAIL',
        null,
        'ACTIVE',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      expect(tenant.isActive()).toBe(true);
    });

    it('should return true for TRIAL status', () => {
      const tenant = new Tenant(
        'id',
        'slug',
        'name',
        'RETAIL',
        null,
        'TRIAL',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      expect(tenant.isActive()).toBe(true);
    });

    it('should return false for SUSPENDED status', () => {
      const tenant = new Tenant(
        'id',
        'slug',
        'name',
        'RETAIL',
        null,
        'SUSPENDED',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      expect(tenant.isActive()).toBe(false);
    });
  });

  describe('isSubscriptionExpired', () => {
    it('should return true if subscription has expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const tenant = new Tenant(
        'id',
        'slug',
        'name',
        'RETAIL',
        null,
        'ACTIVE',
        expiresAt,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      expect(tenant.isSubscriptionExpired()).toBe(true);
    });

    it('should return false if subscription has not expired', () => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
      const tenant = new Tenant(
        'id',
        'slug',
        'name',
        'RETAIL',
        null,
        'ACTIVE',
        expiresAt,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      expect(tenant.isSubscriptionExpired()).toBe(false);
    });

    it('should return false if subscription_expires_at is null', () => {
      const tenant = new Tenant(
        'id',
        'slug',
        'name',
        'RETAIL',
        null,
        'ACTIVE',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      );

      expect(tenant.isSubscriptionExpired()).toBe(false);
    });
  });
});

