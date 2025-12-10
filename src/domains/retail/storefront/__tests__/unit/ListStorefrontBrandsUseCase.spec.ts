/**
 * Tests unitarios para ListStorefrontBrandsUseCase
 */

import { ListStorefrontBrandsUseCase } from '../../application/use-cases/ListStorefrontBrandsUseCase';
import { IBrandRepository } from '../../../brands/domain/repositories/IBrandRepository';
import { Brand } from '../../../brands/domain/entities/Brand';

describe('ListStorefrontBrandsUseCase', () => {
  let useCase: ListStorefrontBrandsUseCase;
  let mockBrandRepository: jest.Mocked<IBrandRepository>;

  beforeEach(() => {
    mockBrandRepository = {
      findAll: jest.fn(),
    } as any;

    useCase = new ListStorefrontBrandsUseCase(mockBrandRepository);
  });

  it('should list active brands', async () => {
    const activeBrand = new Brand(
      'brand-id',
      'tenant-id',
      'Brand Name',
      'brand-slug',
      'https://example.com/logo.png',
      'Brand description',
      true,
      new Date(),
      new Date()
    );

    const inactiveBrand = new Brand(
      'inactive-brand-id',
      'tenant-id',
      'Inactive Brand',
      'inactive-brand-slug',
      null,
      null,
      false,
      new Date(),
      new Date()
    );

    mockBrandRepository.findAll.mockResolvedValue([activeBrand, inactiveBrand]);

    const params = {
      tenant_id: 'tenant-id',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 'brand-id');
    expect(result[0]).toHaveProperty('name', 'Brand Name');
    expect(result[0]).toHaveProperty('slug', 'brand-slug');
    expect(result[0]).toHaveProperty('logo_url', 'https://example.com/logo.png');
  });

  it('should return empty array if no active brands', async () => {
    const inactiveBrand = new Brand(
      'inactive-brand-id',
      'tenant-id',
      'Inactive Brand',
      'inactive-brand-slug',
      null,
      null,
      false,
      new Date(),
      new Date()
    );

    mockBrandRepository.findAll.mockResolvedValue([inactiveBrand]);

    const params = {
      tenant_id: 'tenant-id',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(0);
  });
});

