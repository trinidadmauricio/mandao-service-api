/**
 * Tests unitarios para GetOrderUseCase
 */

import { GetOrderUseCase } from '../../application/use-cases/GetOrderUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    const mockFindFirst = jest.fn();
    mockPrisma = {
      orderDriver: {
        findFirst: mockFindFirst,
      },
    } as any;

    useCase = new GetOrderUseCase(mockOrderRepository, mockPrisma as any);
  });

  it('should get order by id', async () => {
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

    const result = await useCase.execute('order-id');

    expect(result).toEqual(order);
    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('order-id')).rejects.toThrow('Order not found');
  });

  it('should allow LOGISTICS_PROVIDER to access order assigned to their provider', async () => {
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

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute('order-id', context);

    expect(result).toEqual(order);
  });

  it('should throw error if LOGISTICS_PROVIDER tries to access order from different provider', async () => {
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

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('order-id', context)).rejects.toThrow(
      'You do not have permission to access this order'
    );
  });

  it('should throw error if order is not assigned to any logistics provider', async () => {
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

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute('order-id', context)).rejects.toThrow(
      'You do not have permission to access this order'
    );
  });

  it('should allow SAAS_ADMIN to access any order', async () => {
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

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    const result = await useCase.execute('order-id', context);

    expect(result).toEqual(order);
    // SAAS_ADMIN no necesita verificar OrderDriver
    expect(mockPrisma.orderDriver.findFirst).not.toHaveBeenCalled();
  });
});

