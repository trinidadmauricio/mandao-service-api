/**
 * Tests unitarios para CreateDeliveryZoneUseCase
 */

import { CreateDeliveryZoneUseCase } from '../../application/use-cases/CreateDeliveryZoneUseCase';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';

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

  it('should create a delivery zone', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Zone 1',
      boundary: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      base_rate: 5.0,
      rate_per_km: 2.0,
    };

    const zone = new DeliveryZone(
      'zone-id',
      dto.tenant_id,
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

    const result = await useCase.execute(dto);

    expect(result).toEqual(zone);
    expect(mockRepository.create).toHaveBeenCalledWith({
      tenant_id: dto.tenant_id,
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: undefined,
      currency: undefined,
      is_active: undefined,
    });
  });
});
