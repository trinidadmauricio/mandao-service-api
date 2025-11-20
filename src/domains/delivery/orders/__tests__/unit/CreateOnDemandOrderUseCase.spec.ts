/**
 * Tests unitarios para CreateOnDemandOrderUseCase
 */

import { CreateOnDemandOrderUseCase } from '../../application/use-cases/CreateOnDemandOrderUseCase';
import { OrderNumberService } from '../../../../shared/order-counters/application/services/OrderNumberService';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { DeliveryCostCalculator } from '../../../delivery-cost/application/services/DeliveryCostCalculator';
import { PrismaClient } from '@prisma/client';
import { Tenant } from '../../../../shared/tenants/domain/entities/Tenant';

describe('CreateOnDemandOrderUseCase', () => {
  let useCase: CreateOnDemandOrderUseCase;
  let mockOrderNumberService: jest.Mocked<OrderNumberService>;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;
  let mockDeliveryCostCalculator: jest.Mocked<DeliveryCostCalculator>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockOrderNumberService = {
      getNextOrderNumber: jest.fn(),
    } as any;

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    mockDeliveryCostCalculator = {
      calculate: jest.fn(),
    } as any;

    mockPrisma = {
      $transaction: jest.fn(),
    } as any;

    useCase = new CreateOnDemandOrderUseCase(
      mockOrderNumberService,
      mockTenantRepository,
      mockDeliveryCostCalculator,
      mockPrisma as any
    );
  });

  it('should create an on-demand order', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      customer_snapshot: {
        name: 'John Doe',
        phone: '+1234567890',
      },
      delivery_address: {
        street: '123 Main St',
        city: 'City',
        country: 'Country',
        lat: 10.0,
        lng: 20.0,
      },
      items: [
        {
          product_snapshot: {
            name: 'Item 1',
            price: 10.0,
            currency: 'USD',
          },
          quantity: 2,
          unit_price: 10.0,
        },
      ],
      estimated_delivery_at: new Date(),
    };

    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'ON_DEMAND',
      null,
      'ACTIVE',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockOrderNumberService.getNextOrderNumber.mockResolvedValue('ORD-0001');
    mockDeliveryCostCalculator.calculate.mockResolvedValue({
      base_price: 5.0,
      distance_price: 10.0,
      priority_multiplier: 1.0,
      surge_multiplier: 1.0,
      subtotal: 15.0,
      total: 15.0,
      currency: 'USD',
    });

    const mockOrderData = {
      id: 'order-id',
      tenant_id: dto.tenant_id,
      order_number: BigInt(1),
      order_display_number: 'ORD-0001',
      order_type: 'ON_DEMAND',
      customer_id: null,
      customer_snapshot: dto.customer_snapshot,
      delivery_address: dto.delivery_address,
      delivery_lat: dto.delivery_address.lat,
      delivery_lng: dto.delivery_address.lng,
      pickup_address: null,
      pickup_lat: null,
      pickup_lng: null,
      status: 'PENDING',
      cancellation_reason: null,
      scheduled_pickup_at: null,
      estimated_delivery_at: dto.estimated_delivery_at,
      special_instructions: null,
      priority: 'NORMAL',
      cargo_description: null,
      tracking_code: 'TRK-ABC123',
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          create: jest.fn().mockResolvedValue(mockOrderData),
        },
        orderItem: {
          create: jest.fn().mockResolvedValue({}),
        },
        orderSummaryTotal: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return await callback(tx);
    });

    const result = await useCase.execute(dto);

    expect(result.order_display_number).toBe('ORD-0001');
    expect(result.tracking_code).toBeDefined();
    expect(mockTenantRepository.findById).toHaveBeenCalledWith(dto.tenant_id);
    expect(mockOrderNumberService.getNextOrderNumber).toHaveBeenCalledWith(dto.tenant_id);
    expect(mockDeliveryCostCalculator.calculate).toHaveBeenCalled();
  });

  it('should throw error if tenant not found', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      customer_snapshot: { name: 'John', phone: '+123' },
      delivery_address: { street: '123', city: 'City', country: 'Country', lat: 10, lng: 20 },
      items: [{ product_snapshot: { name: 'Item', price: 10, currency: 'USD' }, quantity: 1, unit_price: 10 }],
      estimated_delivery_at: new Date(),
    };

    mockTenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant not found');
  });

  it('should throw error if tenant is not active', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      customer_snapshot: { name: 'John', phone: '+123' },
      delivery_address: { street: '123', city: 'City', country: 'Country', lat: 10, lng: 20 },
      items: [{ product_snapshot: { name: 'Item', price: 10, currency: 'USD' }, quantity: 1, unit_price: 10 }],
      estimated_delivery_at: new Date(),
    };

    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'ON_DEMAND',
      null,
      'SUSPENDED',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);

    await expect(useCase.execute(dto)).rejects.toThrow('Tenant is not active');
  });
});

