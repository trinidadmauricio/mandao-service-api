/**
 * Tests unitarios para GetStorefrontProductUseCase
 */

import { GetStorefrontProductUseCase } from '../../application/use-cases/GetStorefrontProductUseCase';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { CurrencyService } from '../../../../shared/currency/CurrencyService';
import { Product } from '../../../products/domain/entities/Product';
import { Category } from '../../../categories/domain/entities/Category';
import { Brand } from '../../../brands/domain/entities/Brand';
import { ProductVariant } from '../../../product-variants/domain/entities/ProductVariant';

describe('GetStorefrontProductUseCase', () => {
  let useCase: GetStorefrontProductUseCase;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockVariantRepository: jest.Mocked<IProductVariantRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;
  let mockBrandRepository: jest.Mocked<IBrandRepository>;
  let mockCurrencyService: jest.Mocked<CurrencyService>;

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
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

    useCase = new GetStorefrontProductUseCase(
      mockProductRepository,
      mockVariantRepository,
      mockCategoryRepository,
      mockBrandRepository,
      mockCurrencyService
    );
  });

  it('should get product with translations and variants', async () => {
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

    mockProductRepository.findById.mockResolvedValue(product);
    mockCategoryRepository.findById.mockResolvedValue(category);
    mockBrandRepository.findById.mockResolvedValue(brand);
    mockVariantRepository.findByProductId.mockResolvedValue([variant]);
    mockCurrencyService.areCompatible.mockReturnValue(true);

    const params = {
      product_id: 'product-id',
      tenant_id: 'tenant-id',
      locale: 'es',
      currency: 'USD',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveProperty('id', 'product-id');
    expect(result).toHaveProperty('name', 'Nombre del Producto');
    expect(result).toHaveProperty('selling_price', 100);
    expect(result).toHaveProperty('currency', 'USD');
    expect(result.variants).toHaveLength(1);
    expect(result.variants[0]).toHaveProperty('id', 'variant-id');
  });

  it('should throw error if product not found', async () => {
    mockProductRepository.findById.mockResolvedValue(null);

    const params = {
      product_id: 'product-id',
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Product not found');
  });

  it('should throw error if product belongs to different tenant', async () => {
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

    mockProductRepository.findById.mockResolvedValue(product);

    const params = {
      product_id: 'product-id',
      tenant_id: 'tenant-id',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Product belongs to different tenant');
  });

  it('should throw error if currency is not compatible', async () => {
    const product = new Product(
      'product-id',
      'tenant-id',
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

    mockProductRepository.findById.mockResolvedValue(product);
    mockCurrencyService.areCompatible.mockReturnValue(false);

    const params = {
      product_id: 'product-id',
      tenant_id: 'tenant-id',
      currency: 'EUR',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Currency EUR is not compatible');
  });
});

