/**
 * Tests unitarios para User entity
 */

import { User } from '../../domain/entities/User';

describe('User Entity', () => {
  describe('isActive', () => {
    it('should return true for ACTIVE status', () => {
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(user.isActive()).toBe(true);
    });

    it('should return false for INACTIVE status', () => {
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'INACTIVE',
        new Date(),
        new Date()
      );

      expect(user.isActive()).toBe(false);
    });
  });

  describe('isLocked', () => {
    it('should return true if user is locked', () => {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        lockedUntil,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(user.isLocked()).toBe(true);
    });

    it('should return false if user is not locked', () => {
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(user.isLocked()).toBe(false);
    });
  });

  describe('isEmailVerified', () => {
    it('should return true if email is verified', () => {
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        new Date(),
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(user.isEmailVerified()).toBe(true);
    });

    it('should return false if email is not verified', () => {
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(user.isEmailVerified()).toBe(false);
    });
  });

  describe('getFullName', () => {
    it('should return full name', () => {
      const user = new User(
        'id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      expect(user.getFullName()).toBe('John Doe');
    });
  });
});

