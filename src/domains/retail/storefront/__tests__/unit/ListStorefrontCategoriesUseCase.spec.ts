/**
 * Tests unitarios para ListStorefrontCategoriesUseCase
 */

import { ListStorefrontCategoriesUseCase } from '../../application/use-cases/ListStorefrontCategoriesUseCase';
import { ICategoryRepository } from '../../../categories/domain/repositories/ICategoryRepository';
import { Category } from '../../../categories/domain/entities/Category';

describe('ListStorefrontCategoriesUseCase', () => {
  let useCase: ListStorefrontCategoriesUseCase;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockCategoryRepository = {
      findAll: jest.fn(),
    } as any;

    useCase = new ListStorefrontCategoriesUseCase(mockCategoryRepository);
  });

  it('should list categories with children hierarchy', async () => {
    const parentCategory = new Category(
      'parent-id',
      'tenant-id',
      null,
      'Parent Category',
      'parent-category',
      'Parent description',
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

    mockCategoryRepository.findAll.mockResolvedValue([parentCategory, childCategory]);

    const params = {
      tenant_id: 'tenant-id',
      include_children: true,
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 'parent-id');
    expect(result[0]).toHaveProperty('name', 'Parent Category');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0]).toHaveProperty('id', 'child-id');
  });

  it('should list categories without children when include_children is false', async () => {
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
      null,
      null,
      0,
      true,
      new Date(),
      new Date()
    );

    mockCategoryRepository.findAll.mockResolvedValue([parentCategory, childCategory]);

    const params = {
      tenant_id: 'tenant-id',
      include_children: false,
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', 'parent-id');
    expect(result[1]).toHaveProperty('id', 'child-id');
    expect(result[0]).not.toHaveProperty('children');
  });

  it('should filter out inactive categories', async () => {
    const activeCategory = new Category(
      'active-id',
      'tenant-id',
      null,
      'Active Category',
      'active-category',
      null,
      null,
      0,
      true,
      new Date(),
      new Date()
    );

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

    mockCategoryRepository.findAll.mockResolvedValue([activeCategory, inactiveCategory]);

    const params = {
      tenant_id: 'tenant-id',
    };

    const result = await useCase.execute(params);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 'active-id');
  });
});

