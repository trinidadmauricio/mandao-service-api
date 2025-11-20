/**
 * Tests unitarios para OAuthAccessToken entity
 */

import { OAuthAccessToken } from '../../domain/entities/OAuthAccessToken';

describe('OAuthAccessToken Entity', () => {
  describe('isExpired', () => {
    it('should return true if token has expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const token = new OAuthAccessToken(
        'id',
        'token-123',
        'client-id',
        'user-id',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isExpired()).toBe(true);
    });

    it('should return false if token has not expired', () => {
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      const token = new OAuthAccessToken(
        'id',
        'token-123',
        'client-id',
        'user-id',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isExpired()).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should return true if token is valid', () => {
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      const token = new OAuthAccessToken(
        'id',
        'token-123',
        'client-id',
        'user-id',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isValid()).toBe(true);
    });

    it('should return false if token is revoked', () => {
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      const token = new OAuthAccessToken(
        'id',
        'token-123',
        'client-id',
        'user-id',
        'read write',
        expiresAt,
        true,
        new Date()
      );

      expect(token.isValid()).toBe(false);
    });

    it('should return false if token has expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const token = new OAuthAccessToken(
        'id',
        'token-123',
        'client-id',
        'user-id',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isValid()).toBe(false);
    });
  });
});

