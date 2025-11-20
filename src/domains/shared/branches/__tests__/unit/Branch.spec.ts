/**
 * Tests unitarios para Branch entity
 */

import { Branch } from '../../domain/entities/Branch';

describe('Branch Entity', () => {
  describe('isActive', () => {
    it('should return true for ACTIVE status', () => {
      const branch = new Branch(
        'id',
        'tenant-id',
        'Main Branch',
        '123 Main St',
        14.6349,
        -90.5069,
        '+50212345678',
        true,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(branch.isActive()).toBe(true);
    });

    it('should return false for INACTIVE status', () => {
      const branch = new Branch(
        'id',
        'tenant-id',
        'Main Branch',
        '123 Main St',
        14.6349,
        -90.5069,
        '+50212345678',
        true,
        null,
        'INACTIVE',
        new Date(),
        new Date()
      );

      expect(branch.isActive()).toBe(false);
    });
  });

  describe('isMain', () => {
    it('should return true if branch is main', () => {
      const branch = new Branch(
        'id',
        'tenant-id',
        'Main Branch',
        '123 Main St',
        14.6349,
        -90.5069,
        '+50212345678',
        true,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(branch.isMain()).toBe(true);
    });

    it('should return false if branch is not main', () => {
      const branch = new Branch(
        'id',
        'tenant-id',
        'Branch',
        '123 Main St',
        14.6349,
        -90.5069,
        '+50212345678',
        false,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(branch.isMain()).toBe(false);
    });
  });
});

