/**
 * Tests unitarios para GetDriverUseCase
 */

import { GetDriverUseCase } from '../../application/use-cases/GetDriverUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('GetDriverUseCase', () => {
  let useCase: GetDriverUseCase;
  let mockRepository: jest.Mocked<IDriverRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetDriverUseCase(mockRepository);
  });

  it('should get driver by id', async () => {
    const driver = new Driver(
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

    mockRepository.findById.mockResolvedValue(driver);

    const result = await useCase.execute('driver-id');

    expect(result).toEqual(driver);
    expect(mockRepository.findById).toHaveBeenCalledWith('driver-id');
  });

  it('should throw error if driver not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('driver-id')).rejects.toThrow('Driver not found');
  });

  it('should allow LOGISTICS_PROVIDER to access their own driver', async () => {
    const driver = new Driver(
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

    mockRepository.findById.mockResolvedValue(driver);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute('driver-id', context);

    expect(result).toEqual(driver);
  });

  it('should throw error if LOGISTICS_PROVIDER tries to access driver from different provider', async () => {
    const driver = new Driver(
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

    mockRepository.findById.mockResolvedValue(driver);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('driver-id', context)).rejects.toThrow(
      'You do not have permission to access this driver'
    );
  });

  it('should allow SAAS_ADMIN to access any driver', async () => {
    const driver = new Driver(
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

    mockRepository.findById.mockResolvedValue(driver);

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    const result = await useCase.execute('driver-id', context);

    expect(result).toEqual(driver);
  });
});

