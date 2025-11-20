/**
 * Tests unitarios para OAuthClient entity
 */

import { OAuthClient } from '../../domain/entities/OAuthClient';

describe('OAuthClient Entity', () => {
  describe('isActive', () => {
    it('should return true when client is active', () => {
      const client = new OAuthClient(
        'id',
        'tenant-id',
        'client-id',
        'secret-hash',
        'Test Client',
        ['http://localhost:3000/callback'],
        ['authorization_code'],
        'read write',
        true,
        true,
        new Date(),
        new Date()
      );

      expect(client.isActive()).toBe(true);
    });

    it('should return false when client is not active', () => {
      const client = new OAuthClient(
        'id',
        'tenant-id',
        'client-id',
        'secret-hash',
        'Test Client',
        ['http://localhost:3000/callback'],
        ['authorization_code'],
        'read write',
        true,
        false,
        new Date(),
        new Date()
      );

      expect(client.isActive()).toBe(false);
    });
  });

  describe('isValidRedirectUri', () => {
    it('should return true for valid redirect URI', () => {
      const client = new OAuthClient(
        'id',
        'tenant-id',
        'client-id',
        'secret-hash',
        'Test Client',
        ['http://localhost:3000/callback'],
        ['authorization_code'],
        'read write',
        true,
        true,
        new Date(),
        new Date()
      );

      expect(client.isValidRedirectUri('http://localhost:3000/callback')).toBe(true);
    });

    it('should return false for invalid redirect URI', () => {
      const client = new OAuthClient(
        'id',
        'tenant-id',
        'client-id',
        'secret-hash',
        'Test Client',
        ['http://localhost:3000/callback'],
        ['authorization_code'],
        'read write',
        true,
        true,
        new Date(),
        new Date()
      );

      expect(client.isValidRedirectUri('http://evil.com/callback')).toBe(false);
    });
  });

  describe('supportsGrantType', () => {
    it('should return true for supported grant type', () => {
      const client = new OAuthClient(
        'id',
        'tenant-id',
        'client-id',
        'secret-hash',
        'Test Client',
        ['http://localhost:3000/callback'],
        ['authorization_code', 'refresh_token'],
        'read write',
        true,
        true,
        new Date(),
        new Date()
      );

      expect(client.supportsGrantType('authorization_code')).toBe(true);
      expect(client.supportsGrantType('refresh_token')).toBe(true);
    });

    it('should return false for unsupported grant type', () => {
      const client = new OAuthClient(
        'id',
        'tenant-id',
        'client-id',
        'secret-hash',
        'Test Client',
        ['http://localhost:3000/callback'],
        ['authorization_code'],
        'read write',
        true,
        true,
        new Date(),
        new Date()
      );

      expect(client.supportsGrantType('client_credentials')).toBe(false);
    });
  });
});

