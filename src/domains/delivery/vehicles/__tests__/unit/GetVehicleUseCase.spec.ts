/**
 * Tests unitarios para GetVehicleUseCase
 */

import { GetVehicleUseCase } from '../../application/use-cases/GetVehicleUseCase';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('GetVehicleUseCase', () => {
  let useCase: GetVehicleUseCase;
  let mockRepository: jest.Mocked<IVehicleRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetVehicleUseCase(mockRepository);
  });

  it('should get vehicle by id', async () => {
    const vehicle = new Vehicle(
      'vehicle-id',
      'provider-id',
      null,
      'MOTORCYCLE',
      'ABC-123',
      'Honda',
      'CBR',
      2020,
      'Red',
      'POL-123',
      new Date('2025-12-31'),
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(vehicle);

    const result = await useCase.execute('vehicle-id');

    expect(result).toEqual(vehicle);
    expect(mockRepository.findById).toHaveBeenCalledWith('vehicle-id');
  });

  it('should throw error if vehicle not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('vehicle-id')).rejects.toThrow('Vehicle not found');
  });

  it('should allow LOGISTICS_PROVIDER to access their own vehicle', async () => {
    const vehicle = new Vehicle(
      'vehicle-id',
      'provider-id',
      null,
      'MOTORCYCLE',
      'ABC-123',
      'Honda',
      'CBR',
      2020,
      'Red',
      'POL-123',
      new Date('2025-12-31'),
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(vehicle);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute('vehicle-id', context);

    expect(result).toEqual(vehicle);
  });

  it('should throw error if LOGISTICS_PROVIDER tries to access vehicle from different provider', async () => {
    const vehicle = new Vehicle(
      'vehicle-id',
      'different-provider-id',
      null,
      'MOTORCYCLE',
      'ABC-123',
      'Honda',
      'CBR',
      2020,
      'Red',
      'POL-123',
      new Date('2025-12-31'),
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(vehicle);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('vehicle-id', context)).rejects.toThrow(
      'You do not have permission to access this vehicle'
    );
  });

  it('should throw error if LOGISTICS_PROVIDER tries to access vehicle without logistics_provider_id', async () => {
    const vehicle = new Vehicle(
      'vehicle-id',
      null, // Sin logistics_provider_id
      null,
      'MOTORCYCLE',
      'ABC-123',
      'Honda',
      'CBR',
      2020,
      'Red',
      'POL-123',
      new Date('2025-12-31'),
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(vehicle);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('vehicle-id', context)).rejects.toThrow(
      'You do not have permission to access this vehicle'
    );
  });

  it('should allow SAAS_ADMIN to access any vehicle', async () => {
    const vehicle = new Vehicle(
      'vehicle-id',
      'provider-id',
      null,
      'MOTORCYCLE',
      'ABC-123',
      'Honda',
      'CBR',
      2020,
      'Red',
      'POL-123',
      new Date('2025-12-31'),
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(vehicle);

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    const result = await useCase.execute('vehicle-id', context);

    expect(result).toEqual(vehicle);
  });
});

