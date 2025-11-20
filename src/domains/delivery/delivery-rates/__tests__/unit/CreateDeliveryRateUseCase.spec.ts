/**
 * Tests unitarios para CreateDeliveryRateUseCase
 */

import { CreateDeliveryRateUseCase } from '../../application/use-cases/CreateDeliveryRateUseCase';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';

describe('CreateDeliveryRateUseCase', () => {
  let useCase: CreateDeliveryRateUseCase;
  let mockRepository: jest.Mocked<IDeliveryRateRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByZoneAndVehicleType: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateDeliveryRateUseCase(mockRepository);
  });

  it('should create a delivery rate', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      vehicle_type: 'MOTORCYCLE' as const,
      distance_km_min: 0,
      distance_km_max: 10,
      base_price: 5.0,
      price_per_km: 2.0,
      priority_multiplier: { NORMAL: 1.0, URGENT: 1.5 },
    };

    const rate = new DeliveryRate(
      'rate-id',
      dto.tenant_id,
      null,
      dto.vehicle_type,
      dto.distance_km_min,
      dto.distance_km_max,
      dto.base_price,
      dto.price_per_km,
      'USD',
      dto.priority_multiplier,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(rate);

    const result = await useCase.execute(dto);

    expect(result).toEqual(rate);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: dto.tenant_id,
      zone_id: undefined,
      vehicle_type: dto.vehicle_type,
      distance_km_min: dto.distance_km_min,
      distance_km_max: dto.distance_km_max,
      base_price: dto.base_price,
      price_per_km: dto.price_per_km,
      currency: undefined,
      priority_multiplier: dto.priority_multiplier,
    });
  });

  it('should throw error if distance_km_min >= distance_km_max', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      vehicle_type: 'MOTORCYCLE' as const,
      distance_km_min: 10,
      distance_km_max: 5,
      base_price: 5.0,
      price_per_km: 2.0,
      priority_multiplier: { NORMAL: 1.0 },
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      'distance_km_min must be less than distance_km_max'
    );
  });
});

