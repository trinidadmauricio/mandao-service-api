/**
 * Tests unitarios para DeleteDriverUseCase
 */

import { DeleteDriverUseCase } from '../../application/use-cases/DeleteDriverUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';
import { Driver } from '../../domain/entities/Driver';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('DeleteDriverUseCase', () => {
  let useCase: DeleteDriverUseCase;
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

    useCase = new DeleteDriverUseCase(mockRepository, mockUserRepository);
  });

  it('should delete driver and associated user', async () => {
    const existing = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC123',
      'LIC123',
      new Date('1990-01-01'),
      {},
      false,
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

    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.delete.mockResolvedValue(undefined);
    mockUserRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('driver-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('driver-id');
    expect(mockUserRepository.delete).toHaveBeenCalledWith('user-id');
  });

  it('should throw error if driver not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('driver-id')).rejects.toThrow('Driver not found');
  });

  it('should allow LOGISTICS_PROVIDER to delete their own driver and user', async () => {
    const existing = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC123',
      'LIC123',
      new Date('1990-01-01'),
      {},
      false,
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

    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.delete.mockResolvedValue(undefined);
    mockUserRepository.delete.mockResolvedValue(undefined);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await useCase.execute('driver-id', context);

    expect(mockRepository.delete).toHaveBeenCalledWith('driver-id');
    expect(mockUserRepository.delete).toHaveBeenCalledWith('user-id');
  });

  it('should throw error if LOGISTICS_PROVIDER tries to delete driver from different provider', async () => {
    const existing = new Driver(
      'driver-id',
      'different-provider-id',
      'user-id',
      'DOC123',
      'LIC123',
      new Date('1990-01-01'),
      {},
      false,
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

    mockRepository.findById.mockResolvedValue(existing);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('driver-id', context)).rejects.toThrow(
      'You do not have permission to delete this driver'
    );
  });

  it('should not delete user if driver does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-driver-id')).rejects.toThrow('Driver not found');

    expect(mockRepository.delete).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle user deletion error gracefully if user not found', async () => {
    const existing = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC123',
      'LIC123',
      new Date('1990-01-01'),
      {},
      false,
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

    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.delete.mockResolvedValue(undefined);
    mockUserRepository.delete.mockRejectedValue(new Error('User not found'));

    // No debe lanzar error si el usuario no existe
    await useCase.execute('driver-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('driver-id');
    expect(mockUserRepository.delete).toHaveBeenCalledWith('user-id');
  });
});

