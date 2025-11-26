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

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(user);

    const result = await useCase.execute(dto, context);

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

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    mockRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(dto, context)).rejects.toThrow(
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
        'OWNER can only create users with role MERCHANT_USER'
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
        'User creation requires authentication context'
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

  describe('User creation restrictions by role', () => {
    it('should allow SAAS_ADMIN to create all roles except CUSTOMER', async () => {
      const roles = ['SAAS_EDITOR', 'OWNER', 'LOGISTICS_PROVIDER', 'MERCHANT_USER', 'DRIVER'] as const;
      
      for (const role of roles) {
        const dto = {
          email: `test-${role}@example.com`,
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
          role,
        };

        const user = new User(
          'user-id',
          null,
          `test-${role}@example.com`,
          'hashed-password',
          role,
          'Test',
          'User',
          null,
          null,
          null,
          null,
          null,
          null,
          0,
          null,
          'ACTIVE',
          null,
          new Date(),
          new Date()
        );

        const context = {
          currentUserRole: UserRole.SAAS_ADMIN,
          currentUserLogisticsProviderId: null,
        };

        mockRepository.findByEmail.mockResolvedValue(null);
        mockRepository.create.mockResolvedValue(user);

        await useCase.execute(dto, context);
        expect(mockRepository.create).toHaveBeenCalled();
      }
      
      // Test SUPERVISOR separately (requires logistics_provider_id)
      const supervisorDto = {
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
        null,
        0,
        null,
        'ACTIVE',
        'logistics-provider-id',
        new Date(),
        new Date()
      );

      const supervisorContext = {
        currentUserRole: UserRole.SAAS_ADMIN,
        currentUserLogisticsProviderId: null,
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(supervisor);

      await useCase.execute(supervisorDto, supervisorContext);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should reject CUSTOMER creation by SAAS_ADMIN', async () => {
      const dto = {
        email: 'customer@example.com',
        password: 'password123',
        first_name: 'Customer',
        last_name: 'User',
        role: 'CUSTOMER' as const,
      };

      const context = {
        currentUserRole: UserRole.SAAS_ADMIN,
        currentUserLogisticsProviderId: null,
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'CUSTOMER role cannot be created from backoffice'
      );
    });

    it('should reject SAAS role creation by SAAS_EDITOR', async () => {
      const dto = {
        email: 'saas@example.com',
        password: 'password123',
        first_name: 'SAAS',
        last_name: 'Admin',
        role: 'SAAS_ADMIN' as const,
      };

      const context = {
        currentUserRole: UserRole.SAAS_EDITOR,
        currentUserLogisticsProviderId: null,
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'SAAS_EDITOR cannot create SAAS_ADMIN or SAAS_EDITOR users'
      );
    });

    it('should allow OWNER to create only MERCHANT_USER', async () => {
      const dto = {
        email: 'merchant@example.com',
        password: 'password123',
        first_name: 'Merchant',
        last_name: 'User',
        role: 'MERCHANT_USER' as const,
      };

      const user = new User(
        'user-id',
        null,
        'merchant@example.com',
        'hashed-password',
        'MERCHANT_USER',
        'Merchant',
        'User',
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        null,
        'ACTIVE',
        null,
        new Date(),
        new Date()
      );

      const context = {
        currentUserRole: UserRole.OWNER,
        currentUserLogisticsProviderId: null,
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(user);

      await useCase.execute(dto, context);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should reject non-MERCHANT_USER creation by OWNER', async () => {
      const dto = {
        email: 'owner@example.com',
        password: 'password123',
        first_name: 'Owner',
        last_name: 'User',
        role: 'OWNER' as const,
      };

      const context = {
        currentUserRole: UserRole.OWNER,
        currentUserLogisticsProviderId: null,
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'OWNER can only create users with role MERCHANT_USER'
      );
    });

    it('should reject user creation by SUPERVISOR', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'MERCHANT_USER' as const,
      };

      const context = {
        currentUserRole: UserRole.SUPERVISOR,
        currentUserLogisticsProviderId: 'logistics-provider-id',
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'SUPERVISOR role cannot create users'
      );
    });

    it('should reject user creation by MERCHANT_USER', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'MERCHANT_USER' as const,
      };

      const context = {
        currentUserRole: UserRole.MERCHANT_USER,
        currentUserLogisticsProviderId: null,
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'MERCHANT_USER role cannot create users'
      );
    });
  });
});

