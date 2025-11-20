/**
 * Tests unitarios para crypto utilities
 */

import {
  generateSecureToken,
  generateClientId,
  generateClientSecret,
  hashClientSecret,
  verifyClientSecret,
} from '../../crypto.util';

describe('Crypto Utilities', () => {
  describe('generateSecureToken', () => {
    it('should generate a token of specified length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    it('should generate different tokens each time', () => {
      const token1 = generateSecureToken(32);
      const token2 = generateSecureToken(32);
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateClientId', () => {
    it('should generate a client ID with prefix', () => {
      const clientId = generateClientId();
      expect(clientId).toMatch(/^client_[a-f0-9]{32}$/);
    });
  });

  describe('generateClientSecret', () => {
    it('should generate a client secret', () => {
      const secret = generateClientSecret();
      expect(secret).toHaveLength(64); // 32 bytes = 64 hex characters
    });
  });

  describe('hashClientSecret and verifyClientSecret', () => {
    it('should hash and verify client secret', async () => {
      const secret = generateClientSecret();
      const hash = await hashClientSecret(secret);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(secret);

      const isValid = await verifyClientSecret(secret, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect secret', async () => {
      const secret = generateClientSecret();
      const hash = await hashClientSecret(secret);

      const isValid = await verifyClientSecret('wrong-secret', hash);
      expect(isValid).toBe(false);
    });
  });
});

