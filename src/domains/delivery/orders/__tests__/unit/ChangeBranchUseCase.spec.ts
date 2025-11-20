/**
 * Tests unitarios para ChangeBranchUseCase
 */

import { ChangeBranchUseCase } from '../../application/use-cases/ChangeBranchUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IBranchRepository } from '../../../../shared/branches/domain/repositories/IBranchRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';
import { Branch } from '../../../../shared/branches/domain/entities/Branch';

describe('ChangeBranchUseCase', () => {
  let useCase: ChangeBranchUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockBranchRepository: jest.Mocked<IBranchRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    mockBranchRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    useCase = new ChangeBranchUseCase(mockOrderRepository, mockBranchRepository, mockPrisma as any);
  });

  it('should change branch for order', async () => {
    const order = new Order(
      'order-id',
      'tenant-id',
      BigInt(1),
      'ORD-0001',
      'ON_DEMAND',
      null,
      {},
      {},
      10.0,
      20.0,
      null,
      null,
      null,
      'PENDING',
      null,
      null,
      new Date(),
      null,
      'NORMAL',
      null,
      'TRK-123',
      new Date(),
      new Date()
    );

    const branch = new Branch(
      'branch-id',
      'tenant-id',
      'Branch Name',
      '123 Main St',
      10.0,
      20.0,
      '+1234567890',
      false,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockOrderRepository.findById.mockResolvedValue(order);
    mockBranchRepository.findById.mockResolvedValue(branch);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        orderBranch: {
          updateMany: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return await callback(tx);
    });

    const dto = {
      order_id: 'order-id',
      branch_id: 'branch-id',
    };

    await useCase.execute(dto);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockBranchRepository.findById).toHaveBeenCalledWith('branch-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      branch_id: 'branch-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Order not found');
  });

  it('should throw error if branch not active', async () => {
    const order = new Order(
      'order-id',
      'tenant-id',
      BigInt(1),
      'ORD-0001',
      'ON_DEMAND',
      null,
      {},
      {},
      10.0,
      20.0,
      null,
      null,
      null,
      'PENDING',
      null,
      null,
      new Date(),
      null,
      'NORMAL',
      null,
      'TRK-123',
      new Date(),
      new Date()
    );

    const branch = new Branch(
      'branch-id',
      'tenant-id',
      'Branch Name',
      '123 Main St',
      10.0,
      20.0,
      '+1234567890',
      false,
      null,
      'INACTIVE',
      new Date(),
      new Date()
    );

    mockOrderRepository.findById.mockResolvedValue(order);
    mockBranchRepository.findById.mockResolvedValue(branch);

    const dto = {
      order_id: 'order-id',
      branch_id: 'branch-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Branch is not active');
  });
});

