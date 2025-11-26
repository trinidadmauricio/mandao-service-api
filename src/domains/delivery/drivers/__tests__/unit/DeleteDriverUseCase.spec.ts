/**
 * Tests unitarios para DeleteDriverUseCase
 */

import { DeleteDriverUseCase } from '../../application/use-cases/DeleteDriverUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('DeleteDriverUseCase', () => {
  let useCase: DeleteDriverUseCase;
  let mockRepository: jest.Mocked<IDriverRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new DeleteDriverUseCase(mockRepository);
  });

  it('should delete driver', async () => {
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

    await useCase.execute('driver-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('driver-id');
  });

  it('should throw error if driver not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('driver-id')).rejects.toThrow('Driver not found');
  });

  it('should allow LOGISTICS_PROVIDER to delete their own driver', async () => {
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

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await useCase.execute('driver-id', context);

    expect(mockRepository.delete).toHaveBeenCalledWith('driver-id');
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
});

