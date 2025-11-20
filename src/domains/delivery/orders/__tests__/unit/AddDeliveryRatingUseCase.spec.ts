/**
 * Tests unitarios para AddDeliveryRatingUseCase
 */

import { AddDeliveryRatingUseCase } from '../../application/use-cases/AddDeliveryRatingUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';

describe('AddDeliveryRatingUseCase', () => {
  let useCase: AddDeliveryRatingUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      orderDriver: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      deliveryRating: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      driver: {
        update: jest.fn().mockResolvedValue({}),
      },
    } as any;

    useCase = new AddDeliveryRatingUseCase(mockOrderRepository, mockPrisma as any);
  });

  it('should add delivery rating', async () => {
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
    (mockPrisma.orderDriver.findFirst as jest.Mock).mockResolvedValue({
      id: 'order-driver-id',
      driver_id: 'driver-id',
      is_current: true,
    });

    (mockPrisma.deliveryRating.findMany as jest.Mock).mockResolvedValue([
      { customer_rating: 5 },
      { customer_rating: 4 },
    ]);

    const dto = {
      order_id: 'order-id',
      customer_rating: 5,
      customer_comment: 'Great service!',
    };

    await useCase.execute(dto);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockPrisma.deliveryRating.create).toHaveBeenCalled();
    expect(mockPrisma.driver.update).toHaveBeenCalled();
  });

  it('should throw error if rating is out of range', async () => {
    const dto = {
      order_id: 'order-id',
      customer_rating: 6, // Invalid
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Customer rating must be between 1 and 5');
  });

  it('should throw error if order is not delivered', async () => {
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
      customer_rating: 5,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Can only rate delivered orders');
  });
});

