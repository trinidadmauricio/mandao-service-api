/**
 * Tests unitarios para GetStorefrontCategoryBySlugUseCase
 */

import { GetStorefrontCategoryBySlugUseCase } from '../../application/use-cases/GetStorefrontCategoryBySlugUseCase';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { Category } from '../../../categories/domain/entities/Category';

describe('GetStorefrontCategoryBySlugUseCase', () => {
  let useCase: GetStorefrontCategoryBySlugUseCase;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockCategoryRepository = {
      findBySlug: jest.fn(),
      findById: jest.fn(),
    } as any;

    useCase = new GetStorefrontCategoryBySlugUseCase(mockCategoryRepository);
  });

  it('should get category by slug with breadcrumbs', async () => {
    const parentCategory = new Category(
      'parent-id',
      'tenant-id',
      null,
      'Parent Category',
      'parent-category',
      null,
      null,
      0,
      true,
      new Date(),
      new Date()
    );

    const childCategory = new Category(
      'child-id',
      'tenant-id',
      'parent-id',
      'Child Category',
      'child-category',
      'Child description',
      null,
      0,
      true,
      new Date(),
      new Date()
    );

    mockCategoryRepository.findBySlug.mockResolvedValue(childCategory);
    mockCategoryRepository.findById.mockResolvedValue(parentCategory);

    const params = {
      tenant_id: 'tenant-id',
      slug: 'child-category',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveProperty('id', 'child-id');
    expect(result).toHaveProperty('slug', 'child-category');
    expect(result.breadcrumbs).toHaveLength(3);
    expect(result.breadcrumbs[0]).toEqual({ name: 'Home', slug: '/' });
    expect(result.breadcrumbs[1]).toEqual({ name: 'Parent Category', slug: 'parent-category' });
    expect(result.breadcrumbs[2]).toEqual({ name: 'Child Category', slug: 'child-category' });
  });

  it('should throw error if category not found', async () => {
    mockCategoryRepository.findBySlug.mockResolvedValue(null);

    const params = {
      tenant_id: 'tenant-id',
      slug: 'non-existent',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Category not found');
  });

  it('should throw error if category is not active', async () => {
    const inactiveCategory = new Category(
      'inactive-id',
      'tenant-id',
      null,
      'Inactive Category',
      'inactive-category',
      null,
      null,
      0,
      false,
      new Date(),
      new Date()
    );

    mockCategoryRepository.findBySlug.mockResolvedValue(inactiveCategory);

    const params = {
      tenant_id: 'tenant-id',
      slug: 'inactive-category',
    };

    await expect(useCase.execute(params)).rejects.toThrow('Category is not active');
  });
});

