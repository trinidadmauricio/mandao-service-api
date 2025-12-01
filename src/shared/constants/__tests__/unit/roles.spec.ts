/**
 * Tests unitarios para el enum UserRole
 */

import { UserRole } from '../../roles';

describe('UserRole Enum', () => {
  describe('DRIVER role', () => {
    it('should be defined in the UserRole enum', () => {
      expect(UserRole.DRIVER).toBeDefined();
    });

    it('should have the correct value', () => {
      expect(UserRole.DRIVER).toBe('DRIVER');
    });

    it('should be included in all enum values', () => {
      const allRoles = Object.values(UserRole);
      expect(allRoles).toContain('DRIVER');
    });
  });

  describe('All roles', () => {
    it('should include all expected roles', () => {
      const expectedRoles = [
        'SAAS_ADMIN',
        'SAAS_EDITOR',
        'OWNER',
        'SUPERVISOR',
        'MERCHANT_USER',
        'LOGISTICS_PROVIDER',
        'DRIVER',
        'CUSTOMER',
      ];

      const actualRoles = Object.values(UserRole);
      
      expectedRoles.forEach((role) => {
        expect(actualRoles).toContain(role);
      });
    });
  });
});

