/**
 * Tests unitarios para CreateDeliveryRateUseCase
 */

import { CreateDeliveryRateUseCase } from '../../application/use-cases/CreateDeliveryRateUseCase';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { UserRole } from '../../../../../shared/constants/permissions';

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

  it('should create a delivery rate with tenant_id for SAAS_ADMIN', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      vehicle_type: 'MOTORCYCLE' as const,
      distance_km_min: 0,
      distance_km_max: 10,
      base_price: 5.0,
      price_per_km: 2.0,
      priority_multiplier: { NORMAL: 1.0, URGENT: 1.5 },
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
      currentUserTenantId: 'tenant-id',
    };

    const rate = new DeliveryRate(
      'rate-id',
      'tenant-id',
      null,
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

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(rate);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: 'tenant-id',
      logistics_provider_id: null,
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

  it('should auto-assign logistics_provider_id for LOGISTICS_PROVIDER', async () => {
    const dto = {
      vehicle_type: 'MOTORCYCLE' as const,
      distance_km_min: 0,
      distance_km_max: 10,
      base_price: 5.0,
      price_per_km: 2.0,
      priority_multiplier: { NORMAL: 1.0 },
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    const rate = new DeliveryRate(
      'rate-id',
      null,
      'provider-id',
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

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(rate);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: null,
      logistics_provider_id: 'provider-id',
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

  it('should reject if LOGISTICS_PROVIDER tries to create with tenant_id', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      vehicle_type: 'MOTORCYCLE' as const,
      distance_km_min: 0,
      distance_km_max: 10,
      base_price: 5.0,
      price_per_km: 2.0,
      priority_multiplier: { NORMAL: 1.0 },
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'LOGISTICS_PROVIDER and SUPERVISOR cannot create rates with tenant_id'
    );
  });

  it('should reject if SAAS_ADMIN tries to create with logistics_provider_id', async () => {
    const dto = {
      logistics_provider_id: 'provider-id',
      vehicle_type: 'MOTORCYCLE' as const,
      distance_km_min: 0,
      distance_km_max: 10,
      base_price: 5.0,
      price_per_km: 2.0,
      priority_multiplier: { NORMAL: 1.0 },
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
      currentUserTenantId: 'tenant-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'SAAS_ADMIN, SAAS_EDITOR and OWNER cannot create rates with logistics_provider_id'
    );
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

