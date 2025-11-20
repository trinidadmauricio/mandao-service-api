/**
 * Tests unitarios para StockCalculator
 */

import { StockCalculator } from '../../application/services/StockCalculator';
import { IStockByBranchRepository } from '../../domain/repositories/IStockByBranchRepository';
import { StockByBranch } from '../../domain/entities/StockByBranch';

describe('StockCalculator', () => {
  let calculator: StockCalculator;
  let mockRepository: jest.Mocked<IStockByBranchRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByProductAndBranch: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      incrementStock: jest.fn(),
      decrementStock: jest.fn(),
      reserveStock: jest.fn(),
      releaseStock: jest.fn(),
    } as any;

    calculator = new StockCalculator(mockRepository);
  });

  it('should get available stock', async () => {
    const stock = new StockByBranch(
      'stock-id',
      'tenant-id',
      'product-id',
      null,
      'branch-id',
      100,
      20,
      80,
      new Date(),
      new Date(),
      new Date()
    );

    mockRepository.findByProductAndBranch.mockResolvedValue(stock);

    const result = await calculator.getAvailableStock('tenant-id', 'product-id', null, 'branch-id');

    expect(result).toEqual({
      product_id: 'product-id',
      variant_id: null,
      branch_id: 'branch-id',
      available_stock: 80,
      current_stock: 100,
      reserved_stock: 20,
    });
  });

  it('should return null if stock not found', async () => {
    mockRepository.findByProductAndBranch.mockResolvedValue(null);

    const result = await calculator.getAvailableStock('tenant-id', 'product-id', null, 'branch-id');

    expect(result).toBeNull();
  });

  it('should check if has available stock', async () => {
    const stock = new StockByBranch(
      'stock-id',
      'tenant-id',
      'product-id',
      null,
      'branch-id',
      100,
      20,
      80,
      new Date(),
      new Date(),
      new Date()
    );

    mockRepository.findByProductAndBranch.mockResolvedValue(stock);

    const hasStock = await calculator.hasAvailableStock('tenant-id', 'product-id', null, 'branch-id', 50);
    expect(hasStock).toBe(true);

    const noStock = await calculator.hasAvailableStock('tenant-id', 'product-id', null, 'branch-id', 100);
    expect(noStock).toBe(false);
  });

  it('should get multiple stock availability', async () => {
    const stock1 = new StockByBranch(
      'stock-id-1',
      'tenant-id',
      'product-id-1',
      null,
      'branch-id',
      100,
      20,
      80,
      new Date(),
      new Date(),
      new Date()
    );

    const stock2 = new StockByBranch(
      'stock-id-2',
      'tenant-id',
      'product-id-2',
      'variant-id',
      'branch-id',
      50,
      10,
      40,
      new Date(),
      new Date(),
      new Date()
    );

    mockRepository.findByProductAndBranch
      .mockResolvedValueOnce(stock1)
      .mockResolvedValueOnce(stock2);

    const items = [
      { product_id: 'product-id-1', variant_id: null, branch_id: 'branch-id', quantity: 50 },
      { product_id: 'product-id-2', variant_id: 'variant-id', branch_id: 'branch-id', quantity: 30 },
    ];

    const results = await calculator.getMultipleStockAvailability('tenant-id', items);

    expect(results).toHaveLength(2);
    expect(results[0].has_stock).toBe(true);
    expect(results[1].has_stock).toBe(true);
  });
});

