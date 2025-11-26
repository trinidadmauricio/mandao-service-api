/**
 * Tests unitarios para AssignLogisticsProviderUseCase
 */

import { AssignLogisticsProviderUseCase } from '../../application/use-cases/AssignLogisticsProviderUseCase';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ILogisticsProviderRepository } from '../../../logistics-providers/domain/repositories/ILogisticsProviderRepository';
import { PrismaClient } from '@prisma/client';
import { Order } from '../../domain/entities/Order';
import { LogisticsProvider } from '../../../logistics-providers/domain/entities/LogisticsProvider';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('AssignLogisticsProviderUseCase', () => {
  let useCase: AssignLogisticsProviderUseCase;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockLogisticsProviderRepository: jest.Mocked<ILogisticsProviderRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    mockLogisticsProviderRepository = {
      findById: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    useCase = new AssignLogisticsProviderUseCase(
      mockOrderRepository,
      mockLogisticsProviderRepository,
      mockPrisma as any
    );
  });

  it('should assign logistics provider to order as SAAS_ADMIN', async () => {
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

    const logisticsProvider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Company',
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
    mockLogisticsProviderRepository.findById.mockResolvedValue(logisticsProvider);

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
      logistics_provider_id: 'provider-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      isSystemProcess: false,
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockLogisticsProviderRepository.findById).toHaveBeenCalledWith('provider-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should assign logistics provider to order as SAAS_EDITOR', async () => {
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

    const logisticsProvider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Company',
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
    mockLogisticsProviderRepository.findById.mockResolvedValue(logisticsProvider);

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
      logistics_provider_id: 'provider-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_EDITOR,
      isSystemProcess: false,
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockLogisticsProviderRepository.findById).toHaveBeenCalledWith('provider-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      logistics_provider_id: 'provider-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      isSystemProcess: false,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow('Order not found');
  });

  it('should throw error if logistics provider not found', async () => {
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
    mockLogisticsProviderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      logistics_provider_id: 'provider-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      isSystemProcess: false,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow('Logistics provider not found');
  });

  it('should throw error if user is not SAAS role', async () => {
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

    const logisticsProvider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Company',
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
    mockLogisticsProviderRepository.findById.mockResolvedValue(logisticsProvider);

    const dto = {
      order_id: 'order-id',
      logistics_provider_id: 'provider-id',
    };

    const context = {
      currentUserRole: UserRole.OWNER,
      isSystemProcess: false,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'Only SAAS roles or system processes can assign orders to LOGISTICS_PROVIDER'
    );
  });

  it('should allow system process to assign without role check', async () => {
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

    const logisticsProvider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Company',
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
    mockLogisticsProviderRepository.findById.mockResolvedValue(logisticsProvider);

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
      logistics_provider_id: 'provider-id',
    };

    const context = {
      currentUserRole: UserRole.OWNER,
      isSystemProcess: true, // Sistema puede asignar sin importar el rol
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockLogisticsProviderRepository.findById).toHaveBeenCalledWith('provider-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});

