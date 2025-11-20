/**
 * Tests unitarios para DeliveryCostCalculator
 */

import { DeliveryCostCalculator } from '../../application/services/DeliveryCostCalculator';
import { IDeliveryRateRepository } from '../../../delivery-rates/domain/repositories/IDeliveryRateRepository';
import { IDeliveryZoneRepository } from '../../../delivery-zones/domain/repositories/IDeliveryZoneRepository';
import { DeliveryRate } from '../../../delivery-rates/domain/entities/DeliveryRate';
import { DeliveryZone } from '../../../delivery-zones/domain/entities/DeliveryZone';

describe('DeliveryCostCalculator', () => {
  let calculator: DeliveryCostCalculator;
  let mockRateRepository: jest.Mocked<IDeliveryRateRepository>;
  let mockZoneRepository: jest.Mocked<IDeliveryZoneRepository>;

  beforeEach(() => {
    mockRateRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByZoneAndVehicleType: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockZoneRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    calculator = new DeliveryCostCalculator(mockRateRepository, mockZoneRepository);
  });

  it('should calculate delivery cost with zone rate', async () => {
    const zoneId = 'zone-id';
    const rate = new DeliveryRate(
      'rate-id',
      'tenant-id',
      zoneId,
      'MOTORCYCLE',
      0,
      10,
      5.0,
      2.0,
      'USD',
      { NORMAL: 1.0, URGENT: 1.5 },
      new Date(),
      new Date()
    );

    const zone = new DeliveryZone(
      zoneId,
      'tenant-id',
      'Zone 1',
      'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))',
      0,
      0,
      1.2, // surge_multiplier
      'USD',
      true,
      new Date(),
      new Date()
    );

    mockRateRepository.findByZoneAndVehicleType.mockResolvedValue(rate);
    mockZoneRepository.findById.mockResolvedValue(zone);

    const result = await calculator.calculate({
      tenant_id: 'tenant-id',
      distance_km: 5,
      vehicle_type: 'MOTORCYCLE',
      zone_id: zoneId,
      priority: 'NORMAL',
    });

    expect(result.base_price).toBe(5.0);
    expect(result.distance_price).toBe(10.0); // 5 km * 2.0
    expect(result.subtotal).toBe(15.0);
    expect(result.priority_multiplier).toBe(1.0);
    expect(result.surge_multiplier).toBe(1.2);
    expect(result.total).toBe(18.0); // 15.0 * 1.0 * 1.2
    expect(result.currency).toBe('USD');
  });

  it('should calculate delivery cost with urgent priority', async () => {
    const rate = new DeliveryRate(
      'rate-id',
      'tenant-id',
      null,
      'MOTORCYCLE',
      0,
      10,
      5.0,
      2.0,
      'USD',
      { NORMAL: 1.0, URGENT: 1.5 },
      new Date(),
      new Date()
    );

    mockRateRepository.findByZoneAndVehicleType.mockResolvedValue(null);
    mockRateRepository.findAll.mockResolvedValue([rate]);

    const result = await calculator.calculate({
      tenant_id: 'tenant-id',
      distance_km: 5,
      vehicle_type: 'MOTORCYCLE',
      priority: 'URGENT',
    });

    expect(result.total).toBe(22.5); // (5.0 + 10.0) * 1.5 * 1.0
    expect(result.priority_multiplier).toBe(1.5);
  });

  it('should throw error if no rate found', async () => {
    mockRateRepository.findByZoneAndVehicleType.mockResolvedValue(null);
    mockRateRepository.findAll.mockResolvedValue([]);

    await expect(
      calculator.calculate({
        tenant_id: 'tenant-id',
        distance_km: 5,
        vehicle_type: 'MOTORCYCLE',
      })
    ).rejects.toThrow('No delivery rate found for the given parameters');
  });
});

