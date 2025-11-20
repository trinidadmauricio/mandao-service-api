/**
 * Tests unitarios para GetOrdersReportUseCase
 */

import { GetOrdersReportUseCase } from '../../application/use-cases/GetOrdersReportUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';

describe('GetOrdersReportUseCase', () => {
  let useCase: GetOrdersReportUseCase;
  let mockPrisma: any;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockPrisma = {
      order: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      orderBranch: {
        findMany: jest.fn(),
      },
      orderDriver: {
        findMany: jest.fn(),
      },
    };

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetOrdersReportUseCase(mockPrisma as any, mockTenantRepository);
  });

  it('should return orders report with filters', async () => {
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

    const mockOrders = [
      {
        id: 'order-1',
        order_display_number: 'ORD-001',
        tracking_code: 'TRK-ABC123',
        order_type: 'RETAIL',
        status: 'DELIVERED',
        customer_snapshot: { name: 'John Doe' },
        delivery_address: { street: '123 Main St' },
        created_at: new Date(),
        estimated_delivery_at: new Date(),
        order_summary_totals: [
          {
            total_amount: 100,
            currency: 'USD',
          },
        ],
      },
    ];

    const mockBranches = [
      {
        order_id: 'order-1',
        branch_snapshot: { name: 'Branch 1' },
      },
    ];

    const mockDrivers = [
      {
        order_id: 'order-1',
        driver_snapshot: { name: 'Driver 1' },
      },
    ];

    mockPrisma.order.count.mockResolvedValue(1);
    mockPrisma.order.findMany
      .mockResolvedValueOnce(mockOrders as any)
      .mockResolvedValueOnce(mockOrders as any);
    mockPrisma.orderBranch.findMany.mockResolvedValue(mockBranches as any);
    mockPrisma.orderDriver.findMany.mockResolvedValue(mockDrivers as any);

    const filters = {
      page: 1,
      limit: 50,
    };

    const result = await useCase.execute('tenant-id', filters);

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('limit', 50);
    expect(result).toHaveProperty('summary');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty('order_number', 'ORD-001');
    expect(result.items[0]).toHaveProperty('customer_name', 'John Doe');
    expect(result.items[0]).toHaveProperty('total_amount', 100);
  });

  it('should filter by status', async () => {
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
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.orderBranch.findMany.mockResolvedValue([]);
    mockPrisma.orderDriver.findMany.mockResolvedValue([]);

    const filters = {
      page: 1,
      limit: 50,
      status: 'DELIVERED' as const,
    };

    await useCase.execute('tenant-id', filters);

    expect(mockPrisma.order.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tenant_id: 'tenant-id',
        status: 'DELIVERED',
      }),
    });
  });

  it('should filter by order_type', async () => {
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
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.orderBranch.findMany.mockResolvedValue([]);
    mockPrisma.orderDriver.findMany.mockResolvedValue([]);

    const filters = {
      page: 1,
      limit: 50,
      order_type: 'RETAIL' as const,
    };

    await useCase.execute('tenant-id', filters);

    expect(mockPrisma.order.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tenant_id: 'tenant-id',
        order_type: 'RETAIL',
      }),
    });
  });

  it('should filter by date range', async () => {
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
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.orderBranch.findMany.mockResolvedValue([]);
    mockPrisma.orderDriver.findMany.mockResolvedValue([]);

    const dateFrom = new Date('2024-01-01').toISOString();
    const dateTo = new Date('2024-12-31').toISOString();

    const filters = {
      page: 1,
      limit: 50,
      date_from: dateFrom,
      date_to: dateTo,
    };

    await useCase.execute('tenant-id', filters);

    expect(mockPrisma.order.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tenant_id: 'tenant-id',
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      }),
    });
  });

  it('should calculate summary correctly', async () => {
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

    const mockOrders = [
      {
        id: 'order-1',
        order_display_number: 'ORD-001',
        tracking_code: 'TRK-ABC123',
        order_type: 'RETAIL',
        status: 'DELIVERED',
        customer_snapshot: { name: 'John Doe' },
        delivery_address: { street: '123 Main St' },
        created_at: new Date(),
        estimated_delivery_at: new Date(),
        order_summary_totals: [
          {
            total_amount: 100,
            currency: 'USD',
          },
        ],
      },
      {
        id: 'order-2',
        order_display_number: 'ORD-002',
        tracking_code: 'TRK-DEF456',
        order_type: 'RETAIL',
        status: 'PENDING',
        customer_snapshot: { name: 'Jane Doe' },
        delivery_address: { street: '456 Oak Ave' },
        created_at: new Date(),
        estimated_delivery_at: new Date(),
        order_summary_totals: [
          {
            total_amount: 200,
            currency: 'USD',
          },
        ],
      },
    ];

    mockPrisma.order.count.mockResolvedValue(2);
    mockPrisma.order.findMany
      .mockResolvedValueOnce(mockOrders.slice(0, 1) as any)
      .mockResolvedValueOnce(mockOrders as any);
    mockPrisma.orderBranch.findMany.mockResolvedValue([]);
    mockPrisma.orderDriver.findMany.mockResolvedValue([]);

    const filters = {
      page: 1,
      limit: 50,
    };

    const result = await useCase.execute('tenant-id', filters);

    expect(result.summary).toHaveProperty('total_orders', 2);
    expect(result.summary).toHaveProperty('total_amount', 300);
    expect(result.summary.by_status).toHaveProperty('DELIVERED', 1);
    expect(result.summary.by_status).toHaveProperty('PENDING', 1);
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    const filters = {
      page: 1,
      limit: 50,
    };

    await expect(useCase.execute('tenant-id', filters)).rejects.toThrow('Tenant not found');
  });

  it('should handle pagination correctly', async () => {
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
    mockPrisma.order.count.mockResolvedValue(100);
    mockPrisma.order.findMany.mockResolvedValue([]);
    mockPrisma.orderBranch.findMany.mockResolvedValue([]);
    mockPrisma.orderDriver.findMany.mockResolvedValue([]);

    const filters = {
      page: 2,
      limit: 25,
    };

    const result = await useCase.execute('tenant-id', filters);

    expect(result.page).toBe(2);
    expect(result.limit).toBe(25);
    expect(result.total_pages).toBe(4);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 25,
        take: 25,
      })
    );
  });
});
