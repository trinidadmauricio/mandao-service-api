/**
 * Tests unitarios para UpdateDeliveryRateUseCase
 */

import { UpdateDeliveryRateUseCase } from '../../UpdateDeliveryRateUseCase';
import { IDeliveryRateRepository } from '../../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../../domain/entities/DeliveryRate';
import { UserRole } from '../../../../../../shared/constants/permissions';

describe('UpdateDeliveryRateUseCase', () => {
  let useCase: UpdateDeliveryRateUseCase;
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

    useCase = new UpdateDeliveryRateUseCase(mockRepository);
  });

  it('should update a delivery rate', async () => {
    const existing = new DeliveryRate(
      'rate-id',
      'tenant-id',
      null,
      null,
      'MOTORCYCLE',
      0,
      10,
      5.0,
      2.0,
      'USD',
      { NORMAL: 1.0 },
      new Date(),
      new Date()
    );

    const dto = {
      base_price: 6.0,
    };

    const updated = new DeliveryRate(
      'rate-id',
      'tenant-id',
      null,
      null,
      existing.vehicle_type,
      existing.distance_km_min,
      existing.distance_km_max,
      dto.base_price!,
      existing.price_per_km,
      existing.currency,
      existing.priority_multiplier,
      existing.created_at,
      new Date()
    );

    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('rate-id', dto);

    expect(result).toEqual(updated);
    expect(mockRepository.update).toHaveBeenCalledWith('rate-id', dto);
  });

  it('should reject if LOGISTICS_PROVIDER tries to update rate from different provider', async () => {
    const existing = new DeliveryRate(
      'rate-id',
      null,
      'different-provider-id',
      null,
      'MOTORCYCLE',
      0,
      10,
      5.0,
      2.0,
      'USD',
      { NORMAL: 1.0 },
      new Date(),
      new Date()
    );

    const dto = {
      base_price: 6.0,
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
      currentUserTenantId: null,
    };

    mockRepository.findById.mockResolvedValue(existing);

    await expect(useCase.execute('rate-id', dto, context)).rejects.toThrow(
      'You can only update rates from your own logistics provider'
    );
  });

  it('should reject if LOGISTICS_PROVIDER tries to change to tenant_id', async () => {
    const existing = new DeliveryRate(
      'rate-id',
      null,
      'provider-id',
      null,
      'MOTORCYCLE',
      0,
      10,
      5.0,
      2.0,
      'USD',
      { NORMAL: 1.0 },
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

    await expect(useCase.execute('rate-id', dto, context)).rejects.toThrow(
      'LOGISTICS_PROVIDER and SUPERVISOR cannot change rate to tenant_id'
    );
  });
});
