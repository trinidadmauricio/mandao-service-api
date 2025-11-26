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
import { UserRole } from '../../../../../shared/constants/permissions';

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

    const mockFindFirst = jest.fn();
    mockPrisma = {
      $transaction: jest.fn(),
      orderDriver: {
        findFirst: mockFindFirst,
      },
    } as any;

    useCase = new AssignDriverUseCase(
      mockOrderRepository,
      mockDriverRepository,
      mockLogisticsProviderRepository,
      mockPrisma as any
    );
  });

  it('should assign driver to order as SAAS_ADMIN', async () => {
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

    // Mock order_driver con logistics_provider_id
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
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockDriverRepository.findById).toHaveBeenCalledWith('driver-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should assign driver to order as LOGISTICS_PROVIDER with same provider', async () => {
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

    // Mock order_driver con logistics_provider_id igual al del usuario
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
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await useCase.execute(dto, context);

    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockDriverRepository.findById).toHaveBeenCalledWith('driver-id');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      driver_id: 'driver-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow('Order not found');
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

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow('Driver is not available');
  });

  it('should throw error if order is not assigned to LOGISTICS_PROVIDER', async () => {
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

    // Mock order_driver sin logistics_provider_id
    (mockPrisma.orderDriver.findFirst as jest.Mock).mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      driver_id: 'driver-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'Order must be assigned to a LOGISTICS_PROVIDER before assigning a driver'
    );
  });

  it('should throw error if LOGISTICS_PROVIDER tries to assign driver from different provider', async () => {
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
      'different-provider-id', // Driver de otro proveedor
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
      'different-provider-id',
      'tenant-id',
      'Different Provider',
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

    // Mock order_driver con logistics_provider_id igual al del usuario
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

    const dto = {
      order_id: 'order-id',
      driver_id: 'driver-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'User can only assign drivers from their own logistics provider fleet'
    );
  });

  it('should throw error if LOGISTICS_PROVIDER tries to assign to order from different provider', async () => {
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

    // Mock order_driver con logistics_provider_id diferente al del usuario
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
      driver_id: 'driver-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'User can only assign drivers to orders assigned to their logistics provider'
    );
  });

  it('should throw error if user role cannot assign drivers', async () => {
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

    // Mock order_driver para que pase la validación inicial
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

    const dto = {
      order_id: 'order-id',
      driver_id: 'driver-id',
      assigned_by_user_id: 'user-id',
    };

    const context = {
      currentUserRole: UserRole.OWNER,
      currentUserLogisticsProviderId: null,
    };

    await expect(useCase.execute(dto, context)).rejects.toThrow(
      'Users with role OWNER cannot assign drivers'
    );
  });
});

