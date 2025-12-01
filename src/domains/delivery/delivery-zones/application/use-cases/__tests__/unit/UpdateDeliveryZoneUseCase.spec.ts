/**
 * Tests unitarios para UpdateDeliveryZoneUseCase
 */

import { UpdateDeliveryZoneUseCase } from '../../UpdateDeliveryZoneUseCase';
import { IDeliveryZoneRepository } from '../../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../../domain/entities/DeliveryZone';
import { UserRole } from '../../../../../../shared/constants/permissions';

describe('UpdateDeliveryZoneUseCase', () => {
  let useCase: UpdateDeliveryZoneUseCase;
  let mockRepository: jest.Mocked<IDeliveryZoneRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new UpdateDeliveryZoneUseCase(mockRepository);
  });

  it('should update a delivery zone', async () => {
    const existing = new DeliveryZone(
      'zone-id',
      'tenant-id',
      null,
      'Zone 1',
      'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      5.0,
      2.0,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    const dto = {
      name: 'Zone 1 Updated',
      base_rate: 6.0,
    };

    const updated = new DeliveryZone(
      'zone-id',
      'tenant-id',
      null,
      dto.name!,
      existing.boundary,
      dto.base_rate!,
      existing.rate_per_km,
      existing.surge_multiplier,
      existing.currency,
      existing.is_active,
      existing.created_at,
      new Date()
    );

    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('zone-id', dto);

    expect(result).toEqual(updated);
    expect(mockRepository.update).toHaveBeenCalledWith('zone-id', dto);
  });

  it('should reject if LOGISTICS_PROVIDER tries to update zone from different provider', async () => {
    const existing = new DeliveryZone(
      'zone-id',
      null,
      'different-provider-id',
      'Zone 1',
      'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      5.0,
      2.0,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    const dto = {
      name: 'Zone 1 Updated',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    mockRepository.findById.mockResolvedValue(existing);

    await expect(useCase.execute('zone-id', dto, context)).rejects.toThrow(
      'You can only update zones from your own logistics provider'
    );
  });

  it('should reject if LOGISTICS_PROVIDER tries to change to tenant_id', async () => {
    const existing = new DeliveryZone(
      'zone-id',
      null,
      'provider-id',
      'Zone 1',
      'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      5.0,
      2.0,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    const dto = {
      tenant_id: 'tenant-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    mockRepository.findById.mockResolvedValue(existing);

    await expect(useCase.execute('zone-id', dto, context)).rejects.toThrow(
      'LOGISTICS_PROVIDER and SUPERVISOR cannot change zone to tenant_id'
    );
  });

  it('should reject if SAAS_ADMIN tries to change to logistics_provider_id', async () => {
    const existing = new DeliveryZone(
      'zone-id',
      'tenant-id',
      null,
      'Zone 1',
      'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      5.0,
      2.0,
      1.0,
      'USD',
      true,
      new Date(),
      new Date()
    );

    const dto = {
      logistics_provider_id: 'provider-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
      currentUserTenantId: 'tenant-id',
    };

    mockRepository.findById.mockResolvedValue(existing);

    await expect(useCase.execute('zone-id', dto, context)).rejects.toThrow(
      'SAAS_ADMIN, SAAS_EDITOR and OWNER cannot change zone to logistics_provider_id'
    );
  });
});
