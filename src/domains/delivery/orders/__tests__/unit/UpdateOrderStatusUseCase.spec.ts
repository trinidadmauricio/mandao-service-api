/**
 * Tests unitarios para UpdateOrderStatusUseCase
 */

import { UpdateOrderStatusUseCase } from '../../application/use-cases/UpdateOrderStatusUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
      findByTrackingCode: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    useCase = new UpdateOrderStatusUseCase(mockOrderRepository, mockPrisma as any);
  });

  it('should update order status with valid transition', async () => {
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
        order: {
          update: jest.fn().mockResolvedValue({}),
        },
        orderStatusHistory: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return await callback(tx);
    });

    const dto = {
      order_id: 'order-id',
      to_status: 'CONFIRMED' as const,
    };

    await useCase.execute(dto);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error for invalid transition', async () => {
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
      to_status: 'DELIVERED' as const, // Invalid: PENDING -> DELIVERED
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Invalid status transition');
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      to_status: 'CONFIRMED' as const,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Order not found');
  });
});

