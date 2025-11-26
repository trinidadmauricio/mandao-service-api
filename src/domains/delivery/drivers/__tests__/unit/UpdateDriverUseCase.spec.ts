/**
 * Tests unitarios para UpdateDriverUseCase
 */

import { UpdateDriverUseCase } from '../../application/use-cases/UpdateDriverUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('UpdateDriverUseCase', () => {
  let useCase: UpdateDriverUseCase;
  let mockRepository: jest.Mocked<IDriverRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateDriverUseCase(mockRepository);
  });

  it('should update driver', async () => {
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

    const updated = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC456',
      'LIC456',
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
    mockRepository.update.mockResolvedValue(updated);

    const dto = {
      identity_document: 'DOC456',
      driving_license: 'LIC456',
    };

    const result = await useCase.execute('driver-id', dto);

    expect(result).toEqual(updated);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should throw error if driver not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const dto = {
      identity_document: 'DOC456',
    };

    await expect(useCase.execute('driver-id', dto)).rejects.toThrow('Driver not found');
  });

  it('should allow LOGISTICS_PROVIDER to update their own driver', async () => {
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

    const updated = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC456',
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
    mockRepository.update.mockResolvedValue(updated);

    const dto = {
      identity_document: 'DOC456',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute('driver-id', dto, context);

    expect(result).toEqual(updated);
  });

  it('should throw error if LOGISTICS_PROVIDER tries to update driver from different provider', async () => {
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

    const dto = {
      identity_document: 'DOC456',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('driver-id', dto, context)).rejects.toThrow(
      'You do not have permission to update this driver'
    );
  });
});

