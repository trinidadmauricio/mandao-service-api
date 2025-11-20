/**
 * Tests unitarios para ModifyItemsUseCase
 */

import { ModifyItemsUseCase } from '../../application/use-cases/ModifyItemsUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';

describe('ModifyItemsUseCase', () => {
  let useCase: ModifyItemsUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    useCase = new ModifyItemsUseCase(mockOrderRepository, mockPrisma as any);
  });

  it('should modify items for order', async () => {
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

    mockOrderRepository.findById.mockResolvedValue(order);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        orderItem: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return await callback(tx);
    });

    const dto = {
      order_id: 'order-id',
      items: [
        {
          product_snapshot: { name: 'Item 1', price: 10, currency: 'USD' },
          quantity: 2,
          unit_price: 10.0,
        },
      ],
    };

    await useCase.execute(dto);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error if order is completed', async () => {
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
      'DELIVERED',
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

    mockOrderRepository.findById.mockResolvedValue(order);

    const dto = {
      order_id: 'order-id',
      items: [{ product_snapshot: { name: 'Item', price: 10, currency: 'USD' }, quantity: 1, unit_price: 10 }],
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Cannot modify items of completed order');
  });

  it('should throw error if items array is empty', async () => {
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

    mockOrderRepository.findById.mockResolvedValue(order);

    const dto = {
      order_id: 'order-id',
      items: [],
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Order must have at least one item');
  });
});

