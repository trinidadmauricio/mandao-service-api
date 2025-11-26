/**
 * Tests unitarios para CreateVehicleUseCase
 */

import { CreateVehicleUseCase } from '../../application/use-cases/CreateVehicleUseCase';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('CreateVehicleUseCase', () => {
  let useCase: CreateVehicleUseCase;
  let mockRepository: jest.Mocked<IVehicleRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateVehicleUseCase(mockRepository);
  });

  it('should create a vehicle', async () => {
    const dto = {
      vehicle_type: 'MOTORCYCLE' as const,
      license_plate: 'ABC-123',
      brand: 'Honda',
      model: 'CBR',
      year: 2020,
      color: 'Red',
      insurance_policy: 'POL-123',
      insurance_expires_at: new Date('2025-12-31'),
    };

    const vehicle = new Vehicle(
      'vehicle-id',
      null,
      null,
      dto.vehicle_type,
      dto.license_plate,
      dto.brand,
      dto.model,
      dto.year,
      dto.color,
      dto.insurance_policy,
      dto.insurance_expires_at,
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(vehicle);

    const result = await useCase.execute(dto);

    expect(result).toEqual(vehicle);
    expect(mockRepository.create).toHaveBeenCalledWith({
      logistics_provider_id: undefined,
      driver_id: undefined,
      vehicle_type: dto.vehicle_type,
      license_plate: dto.license_plate,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      insurance_policy: dto.insurance_policy,
      insurance_expires_at: dto.insurance_expires_at,
      last_maintenance_at: undefined,
      status: undefined,
      specifications: undefined,
    });
  });

  it('should assign logistics_provider_id automatically for LOGISTICS_PROVIDER', async () => {
    const dto = {
      logistics_provider_id: undefined,
      vehicle_type: 'MOTORCYCLE' as const,
      license_plate: 'ABC-123',
      brand: 'Honda',
      model: 'CBR',
      year: 2020,
      color: 'Red',
      insurance_policy: 'POL-123',
      insurance_expires_at: new Date('2025-12-31'),
    };

    const vehicle = new Vehicle(
      'vehicle-id',
      'provider-id', // Asignado automáticamente
      null,
      dto.vehicle_type,
      dto.license_plate,
      dto.brand,
      dto.model,
      dto.year,
      dto.color,
      dto.insurance_policy,
      dto.insurance_expires_at,
      null,
      'AVAILABLE',
      null,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(vehicle);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(vehicle);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        logistics_provider_id: 'provider-id',
      })
    );
  });

  it('should throw error if LOGISTICS_PROVIDER tries to create vehicle with different provider', async () => {
    const dto = {
      logistics_provider_id: 'different-provider-id',
      vehicle_type: 'MOTORCYCLE' as const,
      license_plate: 'ABC-123',
      brand: 'Honda',
      model: 'CBR',
      year: 2020,
      color: 'Red',
      insurance_policy: 'POL-123',
      insurance_expires_at: new Date('2025-12-31'),
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'You can only create vehicles for your own logistics provider'
    );
  });
});

