/**
 * Tests unitarios para CheckoutUseCase
 */

import { CheckoutUseCase } from '../../application/use-cases/CheckoutUseCase';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { StockCalculator } from '../../../inventory/application/services/StockCalculator';
import { StockReservationService } from '../../../inventory/application/services/StockReservationService';
import { IDeliveryClient } from '../../../clients/IDeliveryClient';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { Tenant } from '../../../../shared/tenants/domain/entities/Tenant';
import { Product } from '../../../products/domain/entities/Product';

describe('CheckoutUseCase', () => {
  let useCase: CheckoutUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockVariantRepository: jest.Mocked<IProductVariantRepository>;
  let mockStockCalculator: jest.Mocked<StockCalculator>;
  let mockStockReservationService: jest.Mocked<StockReservationService>;
  let mockDeliveryClient: jest.Mocked<IDeliveryClient>;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
    } as any;

    mockVariantRepository = {
      findById: jest.fn(),
    } as any;

    mockStockCalculator = {
      getMultipleStockAvailability: jest.fn(),
    } as any;

    mockStockReservationService = {
      reserveStock: jest.fn(),
      releaseStock: jest.fn(),
    } as any;

    mockDeliveryClient = {
      createOrder: jest.fn(),
    } as any;

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new CheckoutUseCase(
      mockProductRepository,
      mockVariantRepository,
      mockStockCalculator,
      mockStockReservationService,
      mockDeliveryClient,
      mockTenantRepository
    );
  });

  it('should throw error if tenant not found', async () => {
    mockTenantRepository.findById.mockResolvedValue(null);

    const dto = {
      tenant_id: 'tenant-id',
      branch_id: 'branch-id',
      customer: { name: 'John Doe', phone: '+1234567890' },
      delivery_address: { street: '123 Main St', city: 'City', country: 'Country', lat: 0, lng: 0 },
      items: [{ product_id: 'product-id', quantity: 1 }],
      estimated_delivery_at: new Date().toISOString(),
    };

    await expect(useCase.execute(dto, 'user-id')).rejects.toThrow('Tenant not found');
  });

  it('should throw error if product not found', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
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
    mockProductRepository.findById.mockResolvedValue(null);

    const dto = {
      tenant_id: 'tenant-id',
      branch_id: 'branch-id',
      customer: { name: 'John Doe', phone: '+1234567890' },
      delivery_address: { street: '123 Main St', city: 'City', country: 'Country', lat: 0, lng: 0 },
      items: [{ product_id: 'product-id', quantity: 1 }],
      estimated_delivery_at: new Date().toISOString(),
    };

    await expect(useCase.execute(dto, 'user-id')).rejects.toThrow('Product product-id not found');
  });

  it('should throw error if product belongs to different tenant', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'tenant-slug',
      'Tenant Name',
      'RETAIL',
      null,
      'ACTIVE',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    const product = new Product(
      'product-id',
      'different-tenant-id',
      'SKU-001',
      null,
      'Product Name',
      null,
      null,
      null,
      'category-id',
      null,
      50,
      100,
      null,
      'USD',
      true,
      10,
      5,
      'UNIT',
      null,
      null,
      {},
      null,
      false,
      true,
      false,
      null,
      null,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockProductRepository.findById.mockResolvedValue(product);

    const dto = {
      tenant_id: 'tenant-id',
      branch_id: 'branch-id',
      customer: { name: 'John Doe', phone: '+1234567890' },
      delivery_address: { street: '123 Main St', city: 'City', country: 'Country', lat: 0, lng: 0 },
      items: [{ product_id: 'product-id', quantity: 1 }],
      estimated_delivery_at: new Date().toISOString(),
    };

    await expect(useCase.execute(dto, 'user-id')).rejects.toThrow('Product belongs to different tenant');
  });
});

