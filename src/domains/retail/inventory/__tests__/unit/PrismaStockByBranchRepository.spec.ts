/**
 * Tests unitarios para PrismaStockByBranchRepository
 */

import { PrismaStockByBranchRepository } from '../../infrastructure/repositories/PrismaStockByBranchRepository';
import { PrismaClient } from '@prisma/client';
import { StockByBranch } from '../../domain/entities/StockByBranch';

describe('PrismaStockByBranchRepository', () => {
  let repository: PrismaStockByBranchRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      stockByBranch: {
        findUnique: jest.fn() as jest.Mock,
        findFirst: jest.fn() as jest.Mock,
        findMany: jest.fn() as jest.Mock,
        create: jest.fn() as jest.Mock,
        update: jest.fn() as jest.Mock,
        delete: jest.fn() as jest.Mock,
      },
    } as any;

    repository = new PrismaStockByBranchRepository(mockPrisma);
  });

  it('should find stock by product and branch', async () => {
    const data = {
      id: 'stock-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      current_stock: 100,
      reserved_stock: 20,
      available_stock: 80,
      last_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    (mockPrisma.stockByBranch.findFirst as jest.Mock).mockResolvedValue(data);

    const result = await repository.findByProductAndBranch('tenant-id', 'product-id', null, 'branch-id');

    expect(result).toBeInstanceOf(StockByBranch);
    expect(result?.product_id).toBe('product-id');
    expect(mockPrisma.stockByBranch.findFirst as jest.Mock).toHaveBeenCalledWith({
      where: {
        product_id: 'product-id',
        variant_id: null,
        branch_id: 'branch-id',
        tenant_id: 'tenant-id',
      },
    });
  });

  it('should increment stock', async () => {
    const existingData = {
      id: 'stock-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      current_stock: 100,
      reserved_stock: 20,
      available_stock: 80,
      last_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedData = {
      ...existingData,
      current_stock: 110,
      available_stock: 90,
    };

    (mockPrisma.stockByBranch.findFirst as jest.Mock).mockResolvedValue(existingData);
    (mockPrisma.stockByBranch.update as jest.Mock).mockResolvedValue(updatedData);

    const result = await repository.incrementStock('tenant-id', 'product-id', null, 'branch-id', 10);

    expect(result.current_stock).toBe(110);
    expect(mockPrisma.stockByBranch.update).toHaveBeenCalledWith({
      where: { id: 'stock-id' },
      data: {
        current_stock: 110,
      },
    });
  });

  it('should create stock if not exists when incrementing', async () => {
    const newData = {
      id: 'stock-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      current_stock: 10,
      reserved_stock: 0,
      available_stock: 10,
      last_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    (mockPrisma.stockByBranch.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.stockByBranch.create as jest.Mock).mockResolvedValue(newData);

    const result = await repository.incrementStock('tenant-id', 'product-id', null, 'branch-id', 10);

    expect(result.current_stock).toBe(10);
    expect(mockPrisma.stockByBranch.create as jest.Mock).toHaveBeenCalled();
  });

  it('should reserve stock', async () => {
    const existingData = {
      id: 'stock-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      current_stock: 100,
      reserved_stock: 20,
      available_stock: 80,
      last_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedData = {
      ...existingData,
      reserved_stock: 30,
      available_stock: 70,
    };

    (mockPrisma.stockByBranch.findFirst as jest.Mock).mockResolvedValue(existingData);
    (mockPrisma.stockByBranch.update as jest.Mock).mockResolvedValue(updatedData);

    const result = await repository.reserveStock('tenant-id', 'product-id', null, 'branch-id', 10);

    expect(result.reserved_stock).toBe(30);
    expect(mockPrisma.stockByBranch.update as jest.Mock).toHaveBeenCalledWith({
      where: { id: 'stock-id' },
      data: {
        reserved_stock: 30,
      },
    });
  });

  it('should throw error if insufficient stock when reserving', async () => {
    const existingData = {
      id: 'stock-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      current_stock: 100,
      reserved_stock: 95,
      available_stock: 5,
      last_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    (mockPrisma.stockByBranch.findFirst as jest.Mock).mockResolvedValue(existingData);

    await expect(
      repository.reserveStock('tenant-id', 'product-id', null, 'branch-id', 10)
    ).rejects.toThrow('Insufficient available stock');
  });
});

