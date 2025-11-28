/**
 * Tests unitarios para CreateDriverUseCase
 */

import { CreateDriverUseCase } from '../../application/use-cases/CreateDriverUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';
import { Driver } from '../../domain/entities/Driver';
import { User } from '../../../../shared/users/domain/entities/User';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('CreateDriverUseCase', () => {
  let useCase: CreateDriverUseCase;
  let mockRepository: jest.Mocked<IDriverRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateDriverUseCase(mockRepository, mockUserRepository);
  });

  it('should create a driver', async () => {
    const dto = {
      logistics_provider_id: 'provider-id',
      user_id: 'user-id',
      identity_document: 'DOC123',
      driving_license: 'LIC123',
      date_of_birth: new Date('1990-01-01'),
      emergency_contact: { name: 'John Doe', phone: '+50212345678' },
      has_own_vehicle: true,
      work_type: 'FULL_TIME' as const,
      documents: { license: 'file.pdf' },
    };

    const user = new User(
      'user-id',
      null, // tenant_id
      'driver@example.com',
      'hashed-password',
      UserRole.DRIVER,
      'Driver',
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
      'provider-id', // logistics_provider_id
      new Date(),
      new Date()
    );

    const driver = new Driver(
      'driver-id',
      dto.logistics_provider_id,
      dto.user_id,
      dto.identity_document,
      dto.driving_license,
      dto.date_of_birth,
      dto.emergency_contact,
      dto.has_own_vehicle,
      null,
      dto.work_type,
      null,
      'AVAILABLE',
      null,
      0,
      dto.documents,
      new Date(),
      new Date()
    );

    mockUserRepository.findById.mockResolvedValue(user);
    mockRepository.findByUserId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(driver);

    const result = await useCase.execute(dto);

    expect(result).toEqual(driver);
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id');
    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-id');
    expect(mockRepository.create).toHaveBeenCalledWith({
      logistics_provider_id: dto.logistics_provider_id,
      user_id: dto.user_id,
      identity_document: dto.identity_document,
      driving_license: dto.driving_license,
      date_of_birth: dto.date_of_birth,
      emergency_contact: dto.emergency_contact,
      has_own_vehicle: dto.has_own_vehicle,
      vehicle_id: undefined,
      work_type: dto.work_type,
      work_zone: undefined,
      availability_status: undefined,
      documents: dto.documents,
    });
  });

  it('should assign logistics_provider_id automatically for LOGISTICS_PROVIDER', async () => {
    const dto = {
      logistics_provider_id: 'provider-id',
      user_id: 'user-id',
      identity_document: 'DOC123',
      driving_license: 'LIC123',
      date_of_birth: new Date('1990-01-01'),
      emergency_contact: { name: 'John Doe', phone: '+50212345678' },
      has_own_vehicle: true,
      work_type: 'FULL_TIME' as const,
      documents: { license: 'file.pdf' },
    };

    const user = new User(
      'user-id',
      null,
      'driver@example.com',
      'hashed-password',
      UserRole.DRIVER,
      'Driver',
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
      'provider-id',
      new Date(),
      new Date()
    );

    const driver = new Driver(
      'driver-id',
      'provider-id', // Se asigna automáticamente
      dto.user_id,
      dto.identity_document,
      dto.driving_license,
      dto.date_of_birth,
      dto.emergency_contact,
      dto.has_own_vehicle,
      null,
      dto.work_type,
      null,
      'AVAILABLE',
      null,
      0,
      dto.documents,
      new Date(),
      new Date()
    );

    mockUserRepository.findById.mockResolvedValue(user);
    mockRepository.findByUserId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(driver);

    const context = {
      currentUserRole: 'LOGISTICS_PROVIDER',
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(driver);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        logistics_provider_id: 'provider-id', // Asignado automáticamente
      })
    );
  });

  it('should throw error if LOGISTICS_PROVIDER tries to create driver with different provider', async () => {
    const dto = {
      logistics_provider_id: 'different-provider-id',
      user_id: 'user-id',
      identity_document: 'DOC123',
      driving_license: 'LIC123',
      date_of_birth: new Date('1990-01-01'),
      emergency_contact: { name: 'John Doe', phone: '+50212345678' },
      has_own_vehicle: true,
      work_type: 'FULL_TIME' as const,
      documents: { license: 'file.pdf' },
    };

    const user = new User(
      'user-id',
      null,
      'driver@example.com',
      'hashed-password',
      UserRole.DRIVER,
      'Driver',
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
      'provider-id',
      new Date(),
      new Date()
    );

    mockUserRepository.findById.mockResolvedValue(user);
    mockRepository.findByUserId.mockResolvedValue(null);

    const context = {
      currentUserRole: 'LOGISTICS_PROVIDER',
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'You can only create drivers for your own logistics provider'
    );
  });

  describe('DRIVER role validations', () => {
    it('should throw error if user does not exist', async () => {
      const dto = {
        logistics_provider_id: 'provider-id',
        user_id: 'non-existent-user-id',
        identity_document: 'DOC123',
        driving_license: 'LIC123',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '+50212345678' },
        has_own_vehicle: true,
        work_type: 'FULL_TIME' as const,
        documents: { license: 'file.pdf' },
      };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow('User not found');
    });

    it('should throw error if user does not have DRIVER role', async () => {
      const dto = {
        logistics_provider_id: 'provider-id',
        user_id: 'user-id',
        identity_document: 'DOC123',
        driving_license: 'LIC123',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '+50212345678' },
        has_own_vehicle: true,
        work_type: 'FULL_TIME' as const,
        documents: { license: 'file.pdf' },
      };

      const user = new User(
        'user-id',
        null,
        'user@example.com',
        'hashed-password',
        UserRole.MERCHANT_USER, // No es DRIVER
        'User',
        'Name',
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

      mockUserRepository.findById.mockResolvedValue(user);

      await expect(useCase.execute(dto)).rejects.toThrow(
        'User must have role DRIVER'
      );
    });

    it('should throw error if user is already associated with another driver', async () => {
      const dto = {
        logistics_provider_id: 'provider-id',
        user_id: 'user-id',
        identity_document: 'DOC123',
        driving_license: 'LIC123',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '+50212345678' },
        has_own_vehicle: true,
        work_type: 'FULL_TIME' as const,
        documents: { license: 'file.pdf' },
      };

      const user = new User(
        'user-id',
        null,
        'driver@example.com',
        'hashed-password',
        UserRole.DRIVER,
        'Driver',
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
        'provider-id',
        new Date(),
        new Date()
      );

      const existingDriver = new Driver(
        'existing-driver-id',
        'provider-id',
        'user-id',
        'DOC123',
        'LIC123',
        new Date('1990-01-01'),
        { name: 'John Doe', phone: '+50212345678' },
        true,
        null,
        'FULL_TIME',
        null,
        'AVAILABLE',
        null,
        0,
        {},
        new Date(),
        new Date()
      );

      mockUserRepository.findById.mockResolvedValue(user);
      mockRepository.findByUserId.mockResolvedValue(existingDriver);

      await expect(useCase.execute(dto)).rejects.toThrow(
        'User is already associated with another driver'
      );
    });

    it('should throw error if user logistics_provider_id does not match', async () => {
      const dto = {
        logistics_provider_id: 'provider-id-1',
        user_id: 'user-id',
        identity_document: 'DOC123',
        driving_license: 'LIC123',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '+50212345678' },
        has_own_vehicle: true,
        work_type: 'FULL_TIME' as const,
        documents: { license: 'file.pdf' },
      };

      const user = new User(
        'user-id',
        null,
        'driver@example.com',
        'hashed-password',
        UserRole.DRIVER,
        'Driver',
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
        'provider-id-2', // Diferente al del driver
        new Date(),
        new Date()
      );

      mockUserRepository.findById.mockResolvedValue(user);
      mockRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(
        'User logistics_provider_id does not match driver logistics_provider_id'
      );
    });

    it('should throw error if user logistics_provider_id does not match LOGISTICS_PROVIDER', async () => {
      const dto = {
        logistics_provider_id: 'provider-id',
        user_id: 'user-id',
        identity_document: 'DOC123',
        driving_license: 'LIC123',
        date_of_birth: new Date('1990-01-01'),
        emergency_contact: { name: 'John Doe', phone: '+50212345678' },
        has_own_vehicle: true,
        work_type: 'FULL_TIME' as const,
        documents: { license: 'file.pdf' },
      };

      const user = new User(
        'user-id',
        null,
        'driver@example.com',
        'hashed-password',
        UserRole.DRIVER,
        'Driver',
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
        'different-provider-id', // Diferente al del LOGISTICS_PROVIDER
        new Date(),
        new Date()
      );

      mockUserRepository.findById.mockResolvedValue(user);
      mockRepository.findByUserId.mockResolvedValue(null);

      const context = {
        currentUserRole: 'LOGISTICS_PROVIDER',
        currentUserLogisticsProviderId: 'provider-id',
      };

      await expect(useCase.execute(dto, context)).rejects.toThrow(
        'User logistics_provider_id does not match your logistics provider'
      );
    });
  });
});

