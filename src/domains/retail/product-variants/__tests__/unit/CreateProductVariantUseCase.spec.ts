/**
 * Tests unitarios para CreateProductVariantUseCase
 */

import { CreateProductVariantUseCase } from '../../application/use-cases/CreateProductVariantUseCase';
import { IProductVariantRepository } from '../../domain/repositories/IProductVariantRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { Product } from '../../../products/domain/entities/Product';
import { Tenant } from '../../../../shared/tenants/domain/entities/Tenant';

describe('CreateProductVariantUseCase', () => {
  let useCase: CreateProductVariantUseCase;
  let mockVariantRepository: jest.Mocked<IProductVariantRepository>;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockVariantRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      findByProductId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockProductRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new CreateProductVariantUseCase(
      mockVariantRepository,
      mockProductRepository,
      mockTenantRepository
    );
  });

  it('should create a product variant', async () => {
    const dto = {
      product_id: 'product-id',
      tenant_id: 'tenant-id',
      sku: 'VARIANT-SKU-001',
      option1_name: 'Size',
      option1_value: 'Large',
    };

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
      'tenant-id',
      'SKU-001',
      null,
      'Product 1',
      null,
      null,
      null,
      'category-id',
      null,
      10.0,
      20.0,
      null,
      'USD',
      true,
      0,
      0,
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

    const variant = new ProductVariant(
      'variant-id',
      dto.product_id,
      dto.tenant_id,
      dto.sku,
      null,
      dto.option1_name,
      dto.option1_value,
      null,
      null,
      null,
      null,
      0,
      null,
      'USD',
      true,
      0,
      null,
      null,
      true,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockProductRepository.findById.mockResolvedValue(product);
    mockVariantRepository.findBySku.mockResolvedValue(null);
    mockVariantRepository.create.mockResolvedValue(variant);

    const result = await useCase.execute(dto);

    expect(result).toEqual(variant);
    expect(mockVariantRepository.findBySku).toHaveBeenCalledWith(dto.tenant_id, dto.sku);
    expect(mockProductRepository.findById).toHaveBeenCalledWith(dto.product_id);
    expect(mockVariantRepository.create).toHaveBeenCalled();
  });

  it('should throw error if SKU already exists', async () => {
    const dto = {
      product_id: 'product-id',
      tenant_id: 'tenant-id',
      sku: 'VARIANT-SKU-001',
    };

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
      'tenant-id',
      'SKU-001',
      null,
      'Product 1',
      null,
      null,
      null,
      'category-id',
      null,
      10.0,
      20.0,
      null,
      'USD',
      true,
      0,
      0,
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

    const existing = new ProductVariant(
      'existing-id',
      'product-id',
      'tenant-id',
      dto.sku,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      null,
      'USD',
      true,
      0,
      null,
      null,
      true,
      new Date(),
      new Date()
    );

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockProductRepository.findById.mockResolvedValue(product);
    mockVariantRepository.findBySku.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow('Product variant with this SKU already exists');
  });
});

