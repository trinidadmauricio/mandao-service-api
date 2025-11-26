/**
 * Tests unitarios para CreateUserUseCase
 */

import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockRepository);
  });

  it('should create a user successfully', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'MERCHANT_USER' as const,
    };

    const user = new User(
      'user-id',
      null,
      'test@example.com',
      'hashed-password',
      'MERCHANT_USER',
      'John',
      'Doe',
      null,
      null,
      null,
      null,
      null,
      null, // last_login_at
      0,
      null,
      'ACTIVE',
      null, // logistics_provider_id
      new Date(),
      new Date()
    );

    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(user);

    const result = await useCase.execute(dto);

    expect(result).toEqual(user);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    const dto = {
      email: 'existing@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'MERCHANT_USER' as const,
    };

    const existingUser = new User(
      'user-id', // id
      null, // tenant_id
      'existing@example.com', // email
      'hash', // password_hash
      'MERCHANT_USER', // role
      'John', // first_name
      'Doe', // last_name
      null, // phone
      null, // email_verified_at
      null, // email_verification_token
      null, // password_reset_token
      null, // password_reset_expires_at
      null, // last_login_at
      0, // failed_login_attempts
      null, // locked_until
      'ACTIVE', // status
      null, // logistics_provider_id
      new Date(), // created_at
      new Date() // updated_at
    );

    mockRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  describe('SUPERVISOR creation restrictions', () => {
    it('should allow LOGISTICS_PROVIDER to create SUPERVISOR', async () => {
      const dto = {
        email: 'supervisor@example.com',
        password: 'password123',
        first_name: 'Supervisor',
        last_name: 'User',
        role: 'SUPERVISOR' as const,
        logistics_provider_id: 'logistics-provider-id',
      };

      const supervisor = new User(
        'user-id',
        null,
        'supervisor@example.com',
        'hashed-password',
        'SUPERVISOR',
        'Supervisor',
        'User',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        'logistics-provider-id',
        new Date(),
        new Date()
      );

      const context = {
        currentUserRole: UserRole.LOGISTICS_PROVIDER,
        currentUserLogisticsProviderId: 'logistics-provider-id',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(supervisor);

      const result = await useCase.execute(dto, context);

      expect(result).toEqual(supervisor);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'SUPERVISOR',
          logistics_provider_id: 'logistics-provider-id',
        })
      );
    });

    it('should reject SUPERVISOR creation by non-LOGISTICS_PROVIDER', async () => {
      const dto = {
        email: 'supervisor@example.com',
        password: 'password123',
        first_name: 'Supervisor',
        last_name: 'User',
        role: 'SUPERVISOR' as const,
        logistics_provider_id: 'logistics-provider-id',
      };

      const context = {
        currentUserRole: UserRole.OWNER,
        currentUserLogisticsProviderId: null,
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'Only LOGISTICS_PROVIDER can create users with role SUPERVISOR'
      );
    });

    it('should reject SUPERVISOR creation without context', async () => {
      const dto = {
        email: 'supervisor@example.com',
        password: 'password123',
        first_name: 'Supervisor',
        last_name: 'User',
        role: 'SUPERVISOR' as const,
        logistics_provider_id: 'logistics-provider-id',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Only LOGISTICS_PROVIDER can create users with role SUPERVISOR'
      );
    });

    it('should automatically assign logistics_provider_id from creator', async () => {
      const dto = {
        email: 'supervisor@example.com',
        password: 'password123',
        first_name: 'Supervisor',
        last_name: 'User',
        role: 'SUPERVISOR' as const,
        // No se pasa logistics_provider_id, debe asignarse automáticamente
      };

      const supervisor = new User(
        'user-id',
        null,
        'supervisor@example.com',
        'hashed-password',
        'SUPERVISOR',
        'Supervisor',
        'User',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        'logistics-provider-id',
        new Date(),
        new Date()
      );

      const context = {
        currentUserRole: UserRole.LOGISTICS_PROVIDER,
        currentUserLogisticsProviderId: 'logistics-provider-id',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(supervisor);

      await useCase.execute(dto, context);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'SUPERVISOR',
          logistics_provider_id: 'logistics-provider-id',
        })
      );
    });

    it('should reject SUPERVISOR creation if LOGISTICS_PROVIDER has no logistics_provider_id', async () => {
      const dto = {
        email: 'supervisor@example.com',
        password: 'password123',
        first_name: 'Supervisor',
        last_name: 'User',
        role: 'SUPERVISOR' as const,
      };

      const context = {
        currentUserRole: UserRole.LOGISTICS_PROVIDER,
        currentUserLogisticsProviderId: null, // LOGISTICS_PROVIDER sin logistics_provider_id
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'LOGISTICS_PROVIDER user must have logistics_provider_id to create SUPERVISOR'
      );
    });
  });
});

