/**
 * Tests unitarios para AssignDriverUseCase
 */

import { AssignDriverUseCase } from '../../application/use-cases/AssignDriverUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IDriverRepository } from '../../../drivers/domain/repositories/IDriverRepository';
import { ILogisticsProviderRepository } from '../../../logistics-providers/domain/repositories/ILogisticsProviderRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';
import { Driver } from '../../../drivers/domain/entities/Driver';
import { LogisticsProvider } from '../../../logistics-providers/domain/entities/LogisticsProvider';

describe('AssignDriverUseCase', () => {
  let useCase: AssignDriverUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockDriverRepository: jest.Mocked<IDriverRepository>;
  let mockLogisticsProviderRepository: jest.Mocked<ILogisticsProviderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    mockDriverRepository = {
      findById: jest.fn(),
    } as any;

    mockLogisticsProviderRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    useCase = new AssignDriverUseCase(
      mockOrderRepository,
      mockDriverRepository,
      mockLogisticsProviderRepository,
      mockPrisma as any
    );
  });

  it('should assign driver to order', async () => {
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

    const driver = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC123',
      'LIC123',
      new Date('1990-01-01'),
      {},
      false,
      null,
      'FULL_TIME',
      null,
      'AVAILABLE',
      null,
      0,
      {},
      new Date(),
      new Date()
    );

    const provider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Name',
      'TAX123',
      'Rep Name',
      '+1234567890',
      'DOC123',
      'VERIFIED',
      null,
      null,
      0,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockOrderRepository.findById.mockResolvedValue(order);
    mockDriverRepository.findById.mockResolvedValue(driver);
    mockLogisticsProviderRepository.findById.mockResolvedValue(provider);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        orderDriver: {
          updateMany: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockResolvedValue({}),
        },
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
      driver_id: 'driver-id',
    };

    await useCase.execute(dto);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockDriverRepository.findById).toHaveBeenCalledWith('driver-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      driver_id: 'driver-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Order not found');
  });

  it('should throw error if driver not available', async () => {
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

    const driver = new Driver(
      'driver-id',
      'provider-id',
      'user-id',
      'DOC123',
      'LIC123',
      new Date('1990-01-01'),
      {},
      false,
      null,
      'FULL_TIME',
      null,
      'BUSY',
      null,
      0,
      {},
      new Date(),
      new Date()
    );

    mockOrderRepository.findById.mockResolvedValue(order);
    mockDriverRepository.findById.mockResolvedValue(driver);

    const dto = {
      order_id: 'order-id',
      driver_id: 'driver-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Driver is not available');
  });
});

