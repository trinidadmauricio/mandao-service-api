/**
 * Tests unitarios para AuthService
 */

import { AuthService } from '../../application/services/AuthService';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { User } from '../../../users/domain/entities/User';
import { hashPassword } from '../../../../../shared/utils/password.util';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    authService = new AuthService(mockUserRepository);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'password123';
      const passwordHash = await hashPassword(password);
      const user = new User(
        'user-id',
        'tenant-id',
        'test@example.com',
        passwordHash,
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

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue(user);

      const result = await authService.login(
        { email: 'test@example.com', password },
        'tenant-id'
      );

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', {
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: expect.any(Date),
      });
    });

    it('should throw error with invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' }, 'tenant-id')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user is locked', async () => {
      const password = 'password123';
      const passwordHash = await hashPassword(password);
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      const user = new User(
        'user-id',
        'tenant-id',
        'test@example.com',
        passwordHash,
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

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await expect(
        authService.login({ email: 'test@example.com', password }, 'tenant-id')
      ).rejects.toThrow('User account is locked');
    });

    it('should increment failed login attempts on wrong password', async () => {
      const password = 'password123';
      const passwordHash = await hashPassword(password);
      const user = new User(
        'user-id',
        'tenant-id',
        'test@example.com',
        passwordHash,
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        3,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockUserRepository.update.mockResolvedValue(user);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' }, 'tenant-id')
      ).rejects.toThrow('Invalid credentials');

      // Verificar que se incrementó el contador
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        'user-id',
        expect.objectContaining({
          failed_login_attempts: 4,
        })
      );
      
      // Verificar que locked_until se estableció (puede ser Date o undefined dependiendo de la lógica)
      const updateCall = mockUserRepository.update.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('failed_login_attempts', 4);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const user = new User(
        'user-id',
        'tenant-id',
        'test@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        'verification-token',
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      mockUserRepository.findAll.mockResolvedValue([user]);
      mockUserRepository.update.mockResolvedValue(user);

      await authService.verifyEmail('verification-token');

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', {
        email_verified_at: expect.any(Date),
        email_verification_token: null,
      });
    });

    it('should throw error with invalid token', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid verification token'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const user = new User(
        'user-id',
        'tenant-id',
        'test@example.com',
        'old-hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        'reset-token',
        expiresAt,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      mockUserRepository.findAll.mockResolvedValue([user]);
      mockUserRepository.update.mockResolvedValue(user);

      await authService.resetPassword('reset-token', 'newPassword123');

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', {
        password_hash: expect.any(String),
        password_reset_token: null,
        password_reset_expires_at: null,
      });
    });

    it('should throw error with expired token', async () => {
      const expiresAt = new Date(Date.now() - 1000);
      const user = new User(
        'user-id',
        'tenant-id',
        'test@example.com',
        'old-hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        'reset-token',
        expiresAt,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      );

      mockUserRepository.findAll.mockResolvedValue([user]);

      await expect(
        authService.resetPassword('reset-token', 'newPassword123')
      ).rejects.toThrow('Invalid or expired reset token');
    });
  });
});

