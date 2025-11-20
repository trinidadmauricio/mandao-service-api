/**
 * Tests unitarios para OAuthAuthorizationService
 */

import { OAuthAuthorizationService } from '../../application/services/OAuthAuthorizationService';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { IOAuthAuthorizationCodeRepository } from '../../domain/repositories/IOAuthAuthorizationCodeRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';
import { OAuthAuthorizationCode } from '../../domain/entities/OAuthAuthorizationCode';

describe('OAuthAuthorizationService', () => {
  let service: OAuthAuthorizationService;
  let mockClientRepository: jest.Mocked<IOAuthClientRepository>;
  let mockCodeRepository: jest.Mocked<IOAuthAuthorizationCodeRepository>;

  beforeEach(() => {
    mockClientRepository = {
      findById: jest.fn(),
      findByClientId: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCodeRepository = {
      findByCode: jest.fn(),
      create: jest.fn(),
      markAsUsed: jest.fn(),
      deleteExpiredCodes: jest.fn(),
    };

    service = new OAuthAuthorizationService(mockClientRepository, mockCodeRepository);
  });

  describe('validateAuthorizationRequest', () => {
    it('should validate a valid authorization request', async () => {
      const client = new OAuthClient(
        'client-id',
        'tenant-id',
        'client_123',
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

      mockClientRepository.findByClientId.mockResolvedValue(client);

      await expect(
        service.validateAuthorizationRequest({
          client_id: 'client_123',
          redirect_uri: 'http://localhost:3000/callback',
          response_type: 'code',
          scope: 'read write',
        })
      ).resolves.not.toThrow();
    });

    it('should throw error for invalid client_id', async () => {
      mockClientRepository.findByClientId.mockResolvedValue(null);

      await expect(
        service.validateAuthorizationRequest({
          client_id: 'invalid',
          redirect_uri: 'http://localhost:3000/callback',
          response_type: 'code',
          scope: 'read write',
        })
      ).rejects.toThrow('Invalid client_id');
    });

    it('should throw error for invalid redirect_uri', async () => {
      const client = new OAuthClient(
        'client-id',
        'tenant-id',
        'client_123',
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

      mockClientRepository.findByClientId.mockResolvedValue(client);

      await expect(
        service.validateAuthorizationRequest({
          client_id: 'client_123',
          redirect_uri: 'http://evil.com/callback',
          response_type: 'code',
          scope: 'read write',
        })
      ).rejects.toThrow('Invalid redirect_uri');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange valid code for user info', async () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const authCode = new OAuthAuthorizationCode(
        'code-id',
        'auth-code-123',
        'client_123',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      mockCodeRepository.findByCode.mockResolvedValue(authCode);
      mockCodeRepository.markAsUsed.mockResolvedValue();

      const result = await service.exchangeCodeForTokens(
        'auth-code-123',
        'client_123',
        'http://localhost:3000/callback'
      );

      expect(result).toEqual({
        user_id: 'user-id',
        scope: 'read write',
      });
      expect(mockCodeRepository.markAsUsed).toHaveBeenCalledWith('auth-code-123');
    });

    it('should throw error for expired code', async () => {
      const expiresAt = new Date(Date.now() - 1000);
      const authCode = new OAuthAuthorizationCode(
        'code-id',
        'auth-code-123',
        'client_123',
        'user-id',
        'http://localhost:3000/callback',
        'read write',
        expiresAt,
        false,
        new Date()
      );

      mockCodeRepository.findByCode.mockResolvedValue(authCode);

      await expect(
        service.exchangeCodeForTokens('auth-code-123', 'client_123', 'http://localhost:3000/callback')
      ).rejects.toThrow('Authorization code expired or already used');
    });
  });
});

