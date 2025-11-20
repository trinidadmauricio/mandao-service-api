/**
 * Tests unitarios para JWT utilities
 */

import { generateAccessToken, generateRefreshToken, verifyToken } from '../../jwt.util';

// Mock JWT_SECRET
process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const payload = {
        sub: 'user-id',
        client_id: 'client-id',
        scope: 'read write',
      };

      const token = generateAccessToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const payload = {
        sub: 'user-id',
        client_id: 'client-id',
        scope: 'read write',
      };

      const token = generateRefreshToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = {
        sub: 'user-id',
        client_id: 'client-id',
        scope: 'read write',
      };

      const token = generateAccessToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.sub).toBe('user-id');
      expect(decoded.client_id).toBe('client-id');
      expect(decoded.scope).toBe('read write');
      expect(decoded.type).toBe('access');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });
  });
});

