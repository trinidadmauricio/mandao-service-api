/**
 * Tests unitarios para ListStorefrontProductsUseCase
 */

import { ListStorefrontProductsUseCase } from '../../application/use-cases/ListStorefrontProductsUseCase';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { CurrencyService } from '../../../../shared/currency/CurrencyService';
import { Product } from '../../../products/domain/entities/Product';
import { Category } from '../../../categories/domain/entities/Category';
import { Brand } from '../../../brands/domain/entities/Brand';
import { ProductVariant } from '../../../product-variants/domain/entities/ProductVariant';

describe('ListStorefrontProductsUseCase', () => {
  let useCase: ListStorefrontProductsUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockVariantRepository: jest.Mocked<IProductVariantRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;
  let mockBrandRepository: jest.Mocked<IBrandRepository>;
  let mockCurrencyService: jest.Mocked<CurrencyService>;

  beforeEach(() => {
    mockProductRepository = {
      findAll: jest.fn(),
    } as any;

    mockVariantRepository = {
      findByProductId: jest.fn(),
    } as any;

    mockCategoryRepository = {
      findById: jest.fn(),
    } as any;

    mockBrandRepository = {
      findById: jest.fn(),
    } as any;

    mockCurrencyService = {
      areCompatible: jest.fn(),
    } as any;

    useCase = new ListStorefrontProductsUseCase(
      mockProductRepository,
      mockVariantRepository,
      mockCategoryRepository,
      mockBrandRepository,
      mockCurrencyService
    );
  });

  it('should list products with translations and currency', async () => {
    const product = new Product(
      'product-id',
      'tenant-id',
      'SKU-001',
      null,
      'Product Name',
      'Product Description',
      { es: 'Nombre del Producto', en: 'Product Name' },
      { es: 'Descripción del Producto', en: 'Product Description' },
      'category-id',
      'brand-id',
      50,
      100,
      120,
      'USD',
      true,
      10,
      5,
      'UNIT',
      null,
      null,
      {},
      'image.jpg',
      true,
      true,
      true,
      null,
      null,
      new Date(),
      new Date()
    );

    const category = new Category('category-id', 'tenant-id', null, 'Category Name', 'category-slug', null, null, 0, true, new Date(), new Date());
    const brand = new Brand('brand-id', 'tenant-id', 'Brand Name', 'brand-slug', null, null, true, new Date(), new Date());
    const variant = new ProductVariant(
      'variant-id',
      'product-id',
      'tenant-id',
      'SKU-001-V1',
      null,
      'Size',
      'Large',
      null,
      null,
      null,
      null,
      10,
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

    mockProductRepository.findAll.mockResolvedValue([product]);
    mockCategoryRepository.findById.mockResolvedValue(category);
    mockBrandRepository.findById.mockResolvedValue(brand);
    mockVariantRepository.findByProductId.mockResolvedValue([variant]);
    mockCurrencyService.areCompatible.mockReturnValue(true);

    const params = {
      tenant_id: 'tenant-id',
      locale: 'es',
      currency: 'USD',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 'product-id');
    expect(result[0]).toHaveProperty('name', 'Nombre del Producto');
    expect(result[0]).toHaveProperty('selling_price', 100);
    expect(result[0]).toHaveProperty('currency', 'USD');
    expect(result[0].category).toHaveProperty('id', 'category-id');
    expect(result[0].brand).toHaveProperty('id', 'brand-id');
  });

  it('should filter products by category', async () => {
    mockProductRepository.findAll.mockResolvedValue([]);

    const params = {
      tenant_id: 'tenant-id',
      category_id: 'category-id',
    };

    await useCase.execute(params);

    expect(mockProductRepository.findAll).toHaveBeenCalledWith(
      'tenant-id',
      'category-id',
      undefined
    );
  });

  it('should apply pagination', async () => {
    const products = Array.from({ length: 30 }, (_, i) =>
      new Product(
        `product-${i}`,
        'tenant-id',
        `SKU-${i}`,
        null,
        `Product ${i}`,
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
      )
    );

    mockProductRepository.findAll.mockResolvedValue(products);
    mockVariantRepository.findByProductId.mockResolvedValue([]);
    mockCurrencyService.areCompatible.mockReturnValue(true);

    const params = {
      tenant_id: 'tenant-id',
      page: 2,
      limit: 10,
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(10);
  });
});

