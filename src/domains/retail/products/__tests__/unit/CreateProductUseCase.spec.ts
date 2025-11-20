/**
 * Tests unitarios para CreateProductUseCase
 */

import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { Product } from '../../domain/entities/Product';
import { Category } from '../../../categories/domain/entities/Category';
import { Tenant } from '../../../../shared/tenants/domain/entities/Tenant';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;
  let mockBrandRepository: jest.Mocked<IBrandRepository>;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockCategoryRepository = {
      findById: jest.fn(),
    } as any;

    mockBrandRepository = {
      findById: jest.fn(),
    } as any;

    mockTenantRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockCategoryRepository,
      mockBrandRepository,
      mockTenantRepository
    );
  });

  it('should create a product', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      sku: 'SKU-001',
      name: 'Product 1',
      category_id: 'category-id',
      cost_price: 10.0,
      selling_price: 20.0,
      images: {},
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

    const category = new Category(
      'category-id',
      'tenant-id',
      null,
      'Category 1',
      'category-1',
      null,
      null,
      0,
      true,
      new Date(),
      new Date()
    );

    const product = new Product(
      'product-id',
      dto.tenant_id,
      dto.sku,
      null,
      dto.name,
      null,
      null,
      null,
      dto.category_id,
      null,
      dto.cost_price,
      dto.selling_price,
      null,
      'USD',
      true,
      0,
      0,
      'UNIT',
      null,
      null,
      dto.images,
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
    mockProductRepository.findBySku.mockResolvedValue(null);
    mockCategoryRepository.findById.mockResolvedValue(category);
    mockProductRepository.create.mockResolvedValue(product);

    const result = await useCase.execute(dto);

    expect(result).toEqual(product);
    expect(mockProductRepository.findBySku).toHaveBeenCalledWith(dto.tenant_id, dto.sku);
    expect(mockCategoryRepository.findById).toHaveBeenCalledWith(dto.category_id);
    expect(mockProductRepository.create).toHaveBeenCalled();
  });

  it('should throw error if SKU already exists', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      sku: 'SKU-001',
      name: 'Product 1',
      category_id: 'category-id',
      cost_price: 10.0,
      selling_price: 20.0,
      images: {},
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

    const existing = new Product(
      'existing-id',
      dto.tenant_id,
      dto.sku,
      null,
      'Existing',
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

    mockTenantRepository.findById.mockResolvedValue(tenant);
    mockProductRepository.findBySku.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow('Product with this SKU already exists');
  });
});

