/**
 * Tests unitarios para OAuthRefreshToken entity
 */

import { OAuthRefreshToken } from '../../domain/entities/OAuthRefreshToken';

describe('OAuthRefreshToken Entity', () => {
  describe('isExpired', () => {
    it('should return true if token has expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const token = new OAuthRefreshToken(
        'id',
        'token-123',
        'access-token-id',
        'client-id',
        'user-id',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isExpired()).toBe(true);
    });

    it('should return false if token has not expired', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = new OAuthRefreshToken(
        'id',
        'token-123',
        'access-token-id',
        'client-id',
        'user-id',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isExpired()).toBe(false);
    });
  });

  describe('isValid', () => {
    it('should return true if token is valid', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = new OAuthRefreshToken(
        'id',
        'token-123',
        'access-token-id',
        'client-id',
        'user-id',
        expiresAt,
        false,
        new Date()
      );

      expect(token.isValid()).toBe(true);
    });

    it('should return false if token is revoked', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = new OAuthRefreshToken(
        'id',
        'token-123',
        'access-token-id',
        'client-id',
        'user-id',
        expiresAt,
        true,
        new Date()
      );

      expect(token.isValid()).toBe(false);
    });
  });
});

