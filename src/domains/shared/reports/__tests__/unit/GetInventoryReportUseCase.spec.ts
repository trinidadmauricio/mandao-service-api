/**
 * Tests unitarios para GetInventoryReportUseCase
 */

import { GetInventoryReportUseCase } from '../../application/use-cases/GetInventoryReportUseCase';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { Tenant } from '../../../tenants/domain/entities/Tenant';

describe('GetInventoryReportUseCase', () => {
  let useCase: GetInventoryReportUseCase;
  let mockPrisma: any;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockPrisma = {
      stockByBranch: {
        findMany: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
      productVariant: {
        findMany: jest.fn(),
      },
      branch: {
        findMany: jest.fn(),
      },
    };

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetInventoryReportUseCase(mockPrisma as any, mockTenantRepository);
  });

  it('should return inventory report', async () => {
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

    const mockStock = [
      {
        product_id: 'product-1',
        variant_id: 'variant-1',
        branch_id: 'branch-1',
        available_stock: 50,
        reserved_stock: 10,
      },
    ];

    const mockProducts = [
      {
        id: 'product-1',
        name: 'Product 1',
        selling_price: 100,
      },
    ];

    const mockVariants = [
      {
        id: 'variant-1',
        option1_value: 'Red',
        option2_value: 'Large',
        option3_value: null,
        price_adjustment: 10,
      },
    ];

    const mockBranches = [
      {
        id: 'branch-1',
        name: 'Branch 1',
      },
    ];

    mockPrisma.stockByBranch.findMany.mockResolvedValue(mockStock as any);
    mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
    mockPrisma.productVariant.findMany.mockResolvedValue(mockVariants as any);
    mockPrisma.branch.findMany.mockResolvedValue(mockBranches as any);

    const result = await useCase.execute('tenant-id');

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('summary');
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty('product_name', 'Product 1');
    expect(result.items[0]).toHaveProperty('available_stock', 50);
    expect(result.items[0]).toHaveProperty('reserved_stock', 10);
    expect(result.items[0]).toHaveProperty('total_stock', 60);
    expect(result.items[0]).toHaveProperty('unit_price', 110); // 100 + 10
  });

  it('should filter by branch_id', async () => {
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
    mockPrisma.stockByBranch.findMany.mockResolvedValue([]);
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.productVariant.findMany.mockResolvedValue([]);
    mockPrisma.branch.findMany.mockResolvedValue([]);

    await useCase.execute('tenant-id', 'branch-1');

    expect(mockPrisma.stockByBranch.findMany).toHaveBeenCalledWith({
      where: {
        tenant_id: 'tenant-id',
        branch_id: 'branch-1',
      },
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

    const mockStock = [
      {
        product_id: 'product-1',
        variant_id: null,
        branch_id: 'branch-1',
        available_stock: 50,
        reserved_stock: 10,
      },
      {
        product_id: 'product-2',
        variant_id: null,
        branch_id: 'branch-2',
        available_stock: 30,
        reserved_stock: 5,
      },
    ];

    const mockProducts = [
      {
        id: 'product-1',
        name: 'Product 1',
        selling_price: 100,
      },
      {
        id: 'product-2',
        name: 'Product 2',
        selling_price: 200,
      },
    ];

    const mockBranches = [
      {
        id: 'branch-1',
        name: 'Branch 1',
      },
      {
        id: 'branch-2',
        name: 'Branch 2',
      },
    ];

    mockPrisma.stockByBranch.findMany.mockResolvedValue(mockStock as any);
    mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
    mockPrisma.productVariant.findMany.mockResolvedValue([]);
    mockPrisma.branch.findMany.mockResolvedValue(mockBranches as any);

    const result = await useCase.execute('tenant-id');

    expect(result.summary).toHaveProperty('total_products', 2);
    expect(result.summary.by_branch).toHaveProperty('branch-1');
    expect(result.summary.by_branch).toHaveProperty('branch-2');
    expect(result.summary.by_branch['branch-1'].products).toBe(1);
    expect(result.summary.by_branch['branch-2'].products).toBe(1);
  });

  it('should handle products without variants', async () => {
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

    const mockStock = [
      {
        product_id: 'product-1',
        variant_id: null,
        branch_id: 'branch-1',
        available_stock: 50,
        reserved_stock: 10,
      },
    ];

    const mockProducts = [
      {
        id: 'product-1',
        name: 'Product 1',
        selling_price: 100,
      },
    ];

    const mockBranches = [
      {
        id: 'branch-1',
        name: 'Branch 1',
      },
    ];

    mockPrisma.stockByBranch.findMany.mockResolvedValue(mockStock as any);
    mockPrisma.product.findMany.mockResolvedValue(mockProducts as any);
    mockPrisma.productVariant.findMany.mockResolvedValue([]);
    mockPrisma.branch.findMany.mockResolvedValue(mockBranches as any);

    const result = await useCase.execute('tenant-id');

    expect(result.items[0]).toHaveProperty('variant_id', null);
    expect(result.items[0]).toHaveProperty('variant_name', null);
    expect(result.items[0]).toHaveProperty('unit_price', 100);
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tenant-id')).rejects.toThrow('Tenant not found');
  });
});

