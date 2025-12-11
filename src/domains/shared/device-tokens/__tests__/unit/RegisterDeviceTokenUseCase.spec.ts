/**
 * Unit Tests para RegisterDeviceTokenUseCase
 */

import 'reflect-metadata';
import { RegisterDeviceTokenUseCase } from '../../application/use-cases/RegisterDeviceTokenUseCase';

describe('RegisterDeviceTokenUseCase', () => {
  let useCase: RegisterDeviceTokenUseCase;
  let mockDeviceTokenRepository: any;

  const mockDeviceToken = {
    id: 'token-123',
    user_id: 'user-123',
    token: 'fcm-token-abc123',
    platform: 'android' as const,
    device_info: { model: 'Pixel 6' },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockDeviceTokenRepository = {
      upsert: jest.fn(),
      findByToken: jest.fn(),
      findActiveByUserId: jest.fn(),
      deactivate: jest.fn(),
    };

    useCase = new RegisterDeviceTokenUseCase(mockDeviceTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('successful registration', () => {
    it('should register a new android device token', async () => {
      mockDeviceTokenRepository.upsert.mockResolvedValue(mockDeviceToken);

      const result = await useCase.execute({
        user_id: 'user-123',
        token: 'fcm-token-abc123',
        platform: 'android',
        device_info: { model: 'Pixel 6' },
      });

      expect(mockDeviceTokenRepository.upsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        token: 'fcm-token-abc123',
        platform: 'android',
        device_info: { model: 'Pixel 6' },
      });
      expect(result).toEqual(mockDeviceToken);
    });

    it('should register a new ios device token', async () => {
      const iosToken = { ...mockDeviceToken, platform: 'ios' as const };
      mockDeviceTokenRepository.upsert.mockResolvedValue(iosToken);

      const result = await useCase.execute({
        user_id: 'user-123',
        token: 'fcm-token-ios',
        platform: 'ios',
      });

      expect(result.platform).toBe('ios');
    });

    it('should register a new web device token', async () => {
      const webToken = { ...mockDeviceToken, platform: 'web' as const };
      mockDeviceTokenRepository.upsert.mockResolvedValue(webToken);

      const result = await useCase.execute({
        user_id: 'user-123',
        token: 'fcm-token-web',
        platform: 'web',
      });

      expect(result.platform).toBe('web');
    });

    it('should trim whitespace from token', async () => {
      mockDeviceTokenRepository.upsert.mockResolvedValue(mockDeviceToken);

      await useCase.execute({
        user_id: 'user-123',
        token: '  fcm-token-abc123  ',
        platform: 'android',
      });

      expect(mockDeviceTokenRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'fcm-token-abc123',
        })
      );
    });

    it('should work without device_info', async () => {
      mockDeviceTokenRepository.upsert.mockResolvedValue({
        ...mockDeviceToken,
        device_info: null,
      });

      const result = await useCase.execute({
        user_id: 'user-123',
        token: 'fcm-token-abc123',
        platform: 'android',
      });

      expect(result.device_info).toBeNull();
    });
  });

  describe('validation errors', () => {
    it('should throw error for empty token', async () => {
      await expect(
        useCase.execute({
          user_id: 'user-123',
          token: '',
          platform: 'android',
        })
      ).rejects.toThrow('Device token cannot be empty');
    });

    it('should throw error for whitespace-only token', async () => {
      await expect(
        useCase.execute({
          user_id: 'user-123',
          token: '   ',
          platform: 'android',
        })
      ).rejects.toThrow('Device token cannot be empty');
    });

    it('should throw error for invalid platform', async () => {
      await expect(
        useCase.execute({
          user_id: 'user-123',
          token: 'valid-token',
          platform: 'invalid' as any,
        })
      ).rejects.toThrow('Invalid platform');
    });
  });

  describe('update existing token', () => {
    it('should update token when it already exists (upsert)', async () => {
      // El upsert actualiza si ya existe
      mockDeviceTokenRepository.upsert.mockResolvedValue({
        ...mockDeviceToken,
        user_id: 'new-user-456', // Token reasignado a nuevo usuario
      });

      const result = await useCase.execute({
        user_id: 'new-user-456',
        token: 'fcm-token-abc123',
        platform: 'android',
      });

      expect(result.user_id).toBe('new-user-456');
    });
  });
});

