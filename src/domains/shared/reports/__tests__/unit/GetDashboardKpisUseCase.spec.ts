/**
 * Tests unitarios para GetDashboardKpisUseCase
 */

import { GetDashboardKpisUseCase } from '../../application/use-cases/GetDashboardKpisUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';

describe('GetDashboardKpisUseCase', () => {
  let useCase: GetDashboardKpisUseCase;
  let mockPrisma: any;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockPrisma = {
      order: {
        count: jest.fn(),
      },
      orderSummaryTotal: {
        findMany: jest.fn(),
      },
      product: {
        count: jest.fn(),
      },
      stockByBranch: {
        count: jest.fn(),
      },
      driver: {
        count: jest.fn(),
      },
      branch: {
        count: jest.fn(),
      },
    };

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetDashboardKpisUseCase(mockPrisma as any, mockTenantRepository);
  });

  it('should return dashboard KPIs', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
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

    // Mock counts
    mockPrisma.order.count
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(5) // today
      .mockResolvedValueOnce(30) // month
      .mockResolvedValueOnce(10) // pending
      .mockResolvedValueOnce(5) // in_transit
      .mockResolvedValueOnce(50); // delivered

    mockPrisma.orderSummaryTotal.findMany
      .mockResolvedValueOnce([{ total_amount: 10000 }, { total_amount: 5000 }] as any) // all
      .mockResolvedValueOnce([{ total_amount: 500 }] as any) // today
      .mockResolvedValueOnce([{ total_amount: 3000 }] as any); // month

    mockPrisma.product.count.mockResolvedValue(50);
    mockPrisma.stockByBranch.count.mockResolvedValue(5);
    mockPrisma.driver.count
      .mockResolvedValueOnce(20) // total
      .mockResolvedValueOnce(15) // active
      .mockResolvedValueOnce(10); // available
    mockPrisma.branch.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(10); // active

    const result = await useCase.execute('tenant-id');

    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('revenue');
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('drivers');
    expect(result).toHaveProperty('branches');

    expect(result.orders.total).toBe(100);
    expect(result.orders.today).toBe(5);
    expect(result.orders.this_month).toBe(30);
    expect(result.orders.pending).toBe(10);
    expect(result.orders.in_transit).toBe(5);
    expect(result.orders.delivered).toBe(50);

    expect(result.revenue.total).toBe(15000);
    expect(result.revenue.today).toBe(500);
    expect(result.revenue.this_month).toBe(3000);
    expect(result.revenue.currency).toBe('USD');

    expect(result.products.total).toBe(50);
    expect(result.products.low_stock).toBe(5);

    expect(result.drivers.total).toBe(20);
    expect(result.drivers.active).toBe(15);
    expect(result.drivers.available).toBe(10);

    expect(result.branches.total).toBe(10);
    expect(result.branches.active).toBe(10);
  });

  it('should calculate revenue correctly', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
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

    mockPrisma.order.count.mockResolvedValue(0);
    mockPrisma.orderSummaryTotal.findMany
      .mockResolvedValueOnce([
        { total_amount: 100 },
        { total_amount: 200 },
        { total_amount: 300 },
      ] as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.stockByBranch.count.mockResolvedValue(0);
    mockPrisma.driver.count.mockResolvedValue(0);
    mockPrisma.branch.count.mockResolvedValue(0);

    const result = await useCase.execute('tenant-id');

    expect(result.revenue.total).toBe(600);
  });

  it('should handle zero values', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
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

    mockPrisma.order.count.mockResolvedValue(0);
    mockPrisma.orderSummaryTotal.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.stockByBranch.count.mockResolvedValue(0);
    mockPrisma.driver.count.mockResolvedValue(0);
    mockPrisma.branch.count.mockResolvedValue(0);

    const result = await useCase.execute('tenant-id');

    expect(result.orders.total).toBe(0);
    expect(result.revenue.total).toBe(0);
    expect(result.products.total).toBe(0);
    expect(result.drivers.total).toBe(0);
    expect(result.branches.total).toBe(0);
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tenant-id')).rejects.toThrow('Tenant not found');
  });
});
