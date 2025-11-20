/**
 * Tests unitarios para OAuthTokenService
 */

import { OAuthTokenService } from '../../application/services/OAuthTokenService';
import { IOAuthTokenRepository } from '../../domain/repositories/IOAuthTokenRepository';
import { OAuthAccessToken } from '../../domain/entities/OAuthAccessToken';
import { OAuthRefreshToken } from '../../domain/entities/OAuthRefreshToken';

describe('OAuthTokenService', () => {
  let service: OAuthTokenService;
  let mockTokenRepository: jest.Mocked<IOAuthTokenRepository>;

  beforeEach(() => {
    mockTokenRepository = {
      findAccessTokenByToken: jest.fn(),
      createAccessToken: jest.fn(),
      revokeAccessToken: jest.fn(),
      findRefreshTokenByToken: jest.fn(),
      createRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeRefreshTokensByAccessToken: jest.fn(),
    };

    service = new OAuthTokenService(mockTokenRepository);
  });

  describe('generateTokensForUser', () => {
    it('should generate access and refresh tokens for user', async () => {
      const accessToken = new OAuthAccessToken(
        'token-id',
        'jwt-token',
        'client-id',
        'user-id',
        'read write',
        new Date(Date.now() + 3600 * 1000),
        false,
        new Date()
      );

      const refreshToken = new OAuthRefreshToken(
        'refresh-id',
        'refresh-token',
        'token-id',
        'client-id',
        'user-id',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        false,
        new Date()
      );

      mockTokenRepository.createAccessToken.mockResolvedValue(accessToken);
      mockTokenRepository.createRefreshToken.mockResolvedValue(refreshToken);

      const result = await service.generateTokensForUser('client-id', 'user-id', 'read write');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe(3600);
      expect(mockTokenRepository.createAccessToken).toHaveBeenCalled();
      expect(mockTokenRepository.createRefreshToken).toHaveBeenCalled();
    });
  });

  describe('generateTokenForClient', () => {
    it('should generate access token for client credentials flow', async () => {
      const accessToken = new OAuthAccessToken(
        'token-id',
        'jwt-token',
        'client-id',
        null,
        'read write',
        new Date(Date.now() + 3600 * 1000),
        false,
        new Date()
      );

      mockTokenRepository.createAccessToken.mockResolvedValue(accessToken);

      const result = await service.generateTokenForClient('client-id', 'read write');

      expect(result).toHaveProperty('access_token');
      expect(result).not.toHaveProperty('refresh_token');
      expect(mockTokenRepository.createAccessToken).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const refreshToken = new OAuthRefreshToken(
        'refresh-id',
        'refresh-token',
        'access-token-id',
        'client-id',
        'user-id',
        expiresAt,
        false,
        new Date()
      );

      const newAccessToken = new OAuthAccessToken(
        'new-token-id',
        'new-jwt-token',
        'client-id',
        'user-id',
        'read write',
        new Date(Date.now() + 3600 * 1000),
        false,
        new Date()
      );

      const newRefreshToken = new OAuthRefreshToken(
        'new-refresh-id',
        'new-refresh-token',
        'new-token-id',
        'client-id',
        'user-id',
        expiresAt,
        false,
        new Date()
      );

      mockTokenRepository.findRefreshTokenByToken.mockResolvedValue(refreshToken);
      mockTokenRepository.revokeRefreshToken.mockResolvedValue();
      mockTokenRepository.revokeRefreshTokensByAccessToken.mockResolvedValue();
      mockTokenRepository.createAccessToken.mockResolvedValue(newAccessToken);
      mockTokenRepository.createRefreshToken.mockResolvedValue(newRefreshToken);

      const result = await service.refreshAccessToken('refresh-token');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(mockTokenRepository.createAccessToken).toHaveBeenCalled();
      expect(mockTokenRepository.createRefreshToken).toHaveBeenCalled();
    });

    it('should throw error for invalid refresh token', async () => {
      mockTokenRepository.findRefreshTokenByToken.mockResolvedValue(null);

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });
});

