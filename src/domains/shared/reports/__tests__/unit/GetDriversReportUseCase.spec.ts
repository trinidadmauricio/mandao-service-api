/**
 * Tests unitarios para GetDriversReportUseCase
 */

import { GetDriversReportUseCase } from '../../application/use-cases/GetDriversReportUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';

describe('GetDriversReportUseCase', () => {
  let useCase: GetDriversReportUseCase;
  let mockPrisma: any;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockPrisma = {
      driver: {
        findMany: jest.fn(),
      },
    };

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetDriversReportUseCase(mockPrisma as any, mockTenantRepository);
  });

  it('should return drivers report', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'ON_DEMAND',
      null,
      'ACTIVE',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);

    const mockDrivers = [
      {
        id: 'driver-1',
        rating_avg: 4.5,
        logistics_provider: {
          company_name: 'Provider 1',
        },
        order_drivers: [
          {
            driver_snapshot: { name: 'Driver 1' },
            order: {
              id: 'order-1',
              status: 'DELIVERED',
            },
          },
          {
            driver_snapshot: { name: 'Driver 1' },
            order: {
              id: 'order-2',
              status: 'CANCELLED',
            },
          },
        ],
        delivery_ratings: [],
      },
    ];

    mockPrisma.driver.findMany.mockResolvedValue(mockDrivers as any);

    const result = await useCase.execute('tenant-id');

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('summary');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty('driver_name', 'Driver 1');
    expect(result.items[0]).toHaveProperty('total_deliveries', 2);
    expect(result.items[0]).toHaveProperty('completed_deliveries', 1);
    expect(result.items[0]).toHaveProperty('cancelled_deliveries', 1);
    expect(result.items[0]).toHaveProperty('average_rating', 4.5);
  });

  it('should filter by logistics_provider_id', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'ON_DEMAND',
      null,
      'ACTIVE',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockPrisma.driver.findMany.mockResolvedValue([]);

    await useCase.execute('tenant-id', 'provider-1');

    expect(mockPrisma.driver.findMany).toHaveBeenCalledWith({
      where: {
        logistics_provider: {
          tenant_id: 'tenant-id',
        },
        logistics_provider_id: 'provider-1',
      },
      include: expect.any(Object),
    });
  });

  it('should calculate summary correctly', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'ON_DEMAND',
      null,
      'ACTIVE',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);

    const mockDrivers = [
      {
        id: 'driver-1',
        rating_avg: 4.5,
        logistics_provider: {
          company_name: 'Provider 1',
        },
        order_drivers: [
          {
            driver_snapshot: { name: 'Driver 1' },
            order: { id: 'order-1', status: 'DELIVERED' },
          },
        ],
        delivery_ratings: [],
      },
      {
        id: 'driver-2',
        rating_avg: 4.0,
        logistics_provider: {
          company_name: 'Provider 1',
        },
        order_drivers: [
          {
            driver_snapshot: { name: 'Driver 2' },
            order: { id: 'order-2', status: 'DELIVERED' },
          },
        ],
        delivery_ratings: [],
      },
    ];

    mockPrisma.driver.findMany.mockResolvedValue(mockDrivers as any);

    const result = await useCase.execute('tenant-id');

    expect(result.summary).toHaveProperty('total_drivers', 2);
    expect(result.summary).toHaveProperty('total_deliveries', 2);
    expect(result.summary.average_rating).toBeCloseTo(4.25);
  });

  it('should handle drivers without orders', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'ON_DEMAND',
      null,
      'ACTIVE',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);

    const mockDrivers = [
      {
        id: 'driver-1',
        rating_avg: null,
        logistics_provider: {
          company_name: 'Provider 1',
        },
        order_drivers: [],
        delivery_ratings: [],
      },
    ];

    mockPrisma.driver.findMany.mockResolvedValue(mockDrivers as any);

    const result = await useCase.execute('tenant-id');

    expect(result.items[0]).toHaveProperty('total_deliveries', 0);
    expect(result.items[0]).toHaveProperty('completed_deliveries', 0);
    expect(result.items[0]).toHaveProperty('average_rating', 0);
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tenant-id')).rejects.toThrow('Tenant not found');
  });
});

