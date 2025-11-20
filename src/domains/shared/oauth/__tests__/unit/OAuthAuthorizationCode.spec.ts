/**
 * Tests unitarios para OAuthAuthorizationCode entity
 */

import { OAuthAuthorizationCode } from '../../domain/entities/OAuthAuthorizationCode';

describe('OAuthAuthorizationCode Entity', () => {
  describe('isExpired', () => {
    it('should return true if code has expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const code = new OAuthAuthorizationCode(
        'id',
        'code-123',
        'client-id',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(code.isExpired()).toBe(true);
    });

    it('should return false if code has not expired', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const code = new OAuthAuthorizationCode(
        'id',
        'code-123',
        'client-id',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(code.isExpired()).toBe(false);
    });
  });

  describe('canBeUsed', () => {
    it('should return true if code can be used', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const code = new OAuthAuthorizationCode(
        'id',
        'code-123',
        'client-id',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(code.canBeUsed()).toBe(true);
    });

    it('should return false if code is already used', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const code = new OAuthAuthorizationCode(
        'id',
        'code-123',
        'client-id',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        true,
        new Date()
      );

      expect(code.canBeUsed()).toBe(false);
    });

    it('should return false if code has expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const code = new OAuthAuthorizationCode(
        'id',
        'code-123',
        'client-id',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(code.canBeUsed()).toBe(false);
    });
  });
});

