/**
 * Tests unitarios para CreateDeliveryZoneUseCase
 */

import { CreateDeliveryZoneUseCase } from '../../application/use-cases/CreateDeliveryZoneUseCase';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('CreateDeliveryZoneUseCase', () => {
  let useCase: CreateDeliveryZoneUseCase;
  let mockRepository: jest.Mocked<IDeliveryZoneRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateDeliveryZoneUseCase(mockRepository);
  });

  it('should create a delivery zone with tenant_id for SAAS_ADMIN', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
      currentUserTenantId: 'tenant-id',
    };

    const zone = new DeliveryZone(
      'zone-id',
      'tenant-id',
      null,
      dto.name,
      dto.boundary,
      dto.base_rate,
      dto.rate_per_km,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(zone);

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(zone);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: 'tenant-id',
      logistics_provider_id: null,
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: undefined,
      currency: undefined,
      is_active: undefined,
    });
  });

  it('should auto-assign logistics_provider_id for LOGISTICS_PROVIDER', async () => {
    const dto = {
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    const zone = new DeliveryZone(
      'zone-id',
      null,
      'provider-id',
      dto.name,
      dto.boundary,
      dto.base_rate,
      dto.rate_per_km,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(zone);

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(zone);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: null,
      logistics_provider_id: 'provider-id',
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: undefined,
      currency: undefined,
      is_active: undefined,
    });
  });

  it('should auto-assign logistics_provider_id for SUPERVISOR', async () => {
    const dto = {
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const context = {
      currentUserRole: UserRole.SUPERVISOR,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    const zone = new DeliveryZone(
      'zone-id',
      null,
      'provider-id',
      dto.name,
      dto.boundary,
      dto.base_rate,
      dto.rate_per_km,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(zone);

    const result = await useCase.execute(dto, context);

    expect(result).toEqual(zone);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: null,
      logistics_provider_id: 'provider-id',
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: undefined,
      currency: undefined,
      is_active: undefined,
    });
  });

  it('should reject if LOGISTICS_PROVIDER tries to create with tenant_id', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'LOGISTICS_PROVIDER and SUPERVISOR cannot create zones with tenant_id'
    );
  });

  it('should reject if LOGISTICS_PROVIDER tries to create with different logistics_provider_id', async () => {
    const dto = {
      logistics_provider_id: 'different-provider-id',
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'You can only create zones for your own logistics provider'
    );
  });

  it('should reject if SAAS_ADMIN tries to create with logistics_provider_id', async () => {
    const dto = {
      logistics_provider_id: 'provider-id',
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
      currentUserTenantId: 'tenant-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'SAAS_ADMIN, SAAS_EDITOR and OWNER cannot create zones with logistics_provider_id'
    );
  });

  it('should reject if neither tenant_id nor logistics_provider_id is provided', async () => {
    const dto = {
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      'Either tenant_id or logistics_provider_id must be provided'
    );
  });
});
