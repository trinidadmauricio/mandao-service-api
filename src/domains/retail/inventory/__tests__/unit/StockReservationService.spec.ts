/**
 * Tests unitarios para StockReservationService
 */

import { StockReservationService } from '../../application/services/StockReservationService';
import { PrismaClient } from '@prisma/client';

describe('StockReservationService', () => {
  let service: StockReservationService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    service = new StockReservationService(mockPrisma);
  });

  it('should reserve stock successfully', async () => {
    const stock = {
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

    const updatedStock = {
      ...stock,
      reserved_stock: 30,
      available_stock: 70,
    };

    const movement = {
      id: 'movement-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      movement_type: 'RESERVATION',
      quantity: 10,
      stock_before: 80,
      stock_after: 70,
      reference_type: 'ORDER',
      reference_id: 'order-id',
      notes: null,
      created_by_user_id: 'user-id',
      created_at: new Date(),
    };

    const mockTx = {
      stockByBranch: {
        findFirst: jest.fn().mockResolvedValue(stock),
        update: jest.fn().mockResolvedValue(updatedStock),
      },
      inventoryMovement: {
        create: jest.fn().mockResolvedValue(movement),
      },
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });

    const request = {
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      quantity: 10,
      reference_type: 'ORDER' as const,
      reference_id: 'order-id',
      created_by_user_id: 'user-id',
    };

    const result = await service.reserveStock(request);

    expect(result.stock.reserved_stock).toBe(30);
    expect(result.movement.movement_type).toBe('RESERVATION');
    expect(mockTx.stockByBranch.findFirst).toHaveBeenCalled();
    expect(mockTx.stockByBranch.update).toHaveBeenCalled();
    expect(mockTx.inventoryMovement.create).toHaveBeenCalled();
  });

  it('should throw error if stock not found', async () => {
    const mockTx = {
      stockByBranch: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });

    const request = {
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      quantity: 10,
      reference_type: 'ORDER' as const,
      reference_id: 'order-id',
      created_by_user_id: 'user-id',
    };

    await expect(service.reserveStock(request)).rejects.toThrow('Stock not found');
  });

  it('should throw error if insufficient stock', async () => {
    const stock = {
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

    const mockTx = {
      stockByBranch: {
        findFirst: jest.fn().mockResolvedValue(stock),
      },
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });

    const request = {
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      quantity: 10,
      reference_type: 'ORDER' as const,
      reference_id: 'order-id',
      created_by_user_id: 'user-id',
    };

    await expect(service.reserveStock(request)).rejects.toThrow('Insufficient available stock');
  });

  it('should release stock successfully', async () => {
    const stock = {
      id: 'stock-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      current_stock: 100,
      reserved_stock: 30,
      available_stock: 70,
      last_updated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedStock = {
      ...stock,
      reserved_stock: 20,
      available_stock: 80,
    };

    const movement = {
      id: 'movement-id',
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      movement_type: 'RELEASE',
      quantity: 10,
      stock_before: 70,
      stock_after: 80,
      reference_type: 'ORDER',
      reference_id: 'order-id',
      notes: null,
      created_by_user_id: 'user-id',
      created_at: new Date(),
    };

    const mockTx = {
      stockByBranch: {
        findFirst: jest.fn().mockResolvedValue(stock),
        update: jest.fn().mockResolvedValue(updatedStock),
      },
      inventoryMovement: {
        create: jest.fn().mockResolvedValue(movement),
      },
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTx);
    });

    const request = {
      tenant_id: 'tenant-id',
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      quantity: 10,
      reference_type: 'ORDER' as const,
      reference_id: 'order-id',
      created_by_user_id: 'user-id',
    };

    const result = await service.releaseStock(request);

    expect(result.stock.reserved_stock).toBe(20);
    expect(result.movement.movement_type).toBe('RELEASE');
    expect(mockTx.stockByBranch.update).toHaveBeenCalled();
    expect(mockTx.inventoryMovement.create).toHaveBeenCalled();
  });
});

