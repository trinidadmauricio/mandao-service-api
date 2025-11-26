/**
 * Tests unitarios para MarkAsAutomaticUseCase
 */

import { MarkAsAutomaticUseCase } from '../../application/use-cases/MarkAsAutomaticUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('MarkAsAutomaticUseCase', () => {
  let useCase: MarkAsAutomaticUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    const mockFindFirst = jest.fn();
    mockPrisma = {
      $transaction: jest.fn(),
      orderDriver: {
        findFirst: mockFindFirst,
      },
    } as any;

    useCase = new MarkAsAutomaticUseCase(mockOrderRepository, mockPrisma as any);
  });

  it('should mark order as automatic as LOGISTICS_PROVIDER', async () => {
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
    (mockPrisma.orderDriver.findFirst as jest.Mock).mockResolvedValue({
      id: 'order-driver-id',
      order_id: 'order-id',
      driver_id: null,
      logistics_provider_id: 'provider-id',
      is_current: true,
      assigned_at: new Date(),
      unassigned_at: null,
      assigned_by_user_id: null,
      driver_snapshot: {},
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

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
      marked_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockPrisma.orderDriver.findFirst).toHaveBeenCalled();
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should mark order as automatic as SUPERVISOR', async () => {
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
    (mockPrisma.orderDriver.findFirst as jest.Mock).mockResolvedValue({
      id: 'order-driver-id',
      order_id: 'order-id',
      driver_id: null,
      logistics_provider_id: 'provider-id',
      is_current: true,
      assigned_at: new Date(),
      unassigned_at: null,
      assigned_by_user_id: null,
      driver_snapshot: {},
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

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
      marked_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.SUPERVISOR,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockPrisma.orderDriver.findFirst).toHaveBeenCalled();
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow('Order not found');
  });

  it('should throw error if context is missing', async () => {
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
    };

    await expect(useCase.execute(dto, undefined)).rejects.toThrow(
      'Marking order as automatic requires authentication context'
    );
  });

  it('should throw error if user is not LOGISTICS_PROVIDER or SUPERVISOR', async () => {
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
    };

    const context = {
      currentUserRole: UserRole.OWNER,
      currentUserLogisticsProviderId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'Only LOGISTICS_PROVIDER or SUPERVISOR can mark orders as automatic'
    );
  });

  it('should throw error if user does not have logistics_provider_id', async () => {
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
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'LOGISTICS_PROVIDER user must have logistics_provider_id to mark orders as automatic'
    );
  });

  it('should throw error if order is not assigned to a logistics provider', async () => {
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
    (mockPrisma.orderDriver.findFirst as jest.Mock).mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'Order must be assigned to a LOGISTICS_PROVIDER before marking as automatic'
    );
  });

  it('should throw error if order is assigned to different logistics provider', async () => {
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
    (mockPrisma.orderDriver.findFirst as jest.Mock).mockResolvedValue({
      id: 'order-driver-id',
      order_id: 'order-id',
      driver_id: null,
      logistics_provider_id: 'different-provider-id',
      is_current: true,
      assigned_at: new Date(),
      unassigned_at: null,
      assigned_by_user_id: null,
      driver_snapshot: {},
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

    const dto = {
      order_id: 'order-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'You can only mark orders assigned to your logistics provider as automatic'
    );
  });
});

