/**
 * Tests unitarios para CreateCategoryUseCase
 */

import { CreateCategoryUseCase } from '../../application/use-cases/CreateCategoryUseCase';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let mockRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateCategoryUseCase(mockRepository);
  });

  it('should create a category', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Category 1',
      slug: 'category-1',
    };

    const category = new Category(
      'category-id',
      dto.tenant_id,
      null,
      dto.name,
      dto.slug,
      null,
      null,
      0,
      true,
      new Date(),
      new Date()
    );

    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(category);

    const result = await useCase.execute(dto);

    expect(result).toEqual(category);
    expect(mockRepository.findBySlug).toHaveBeenCalledWith(dto.tenant_id, dto.slug);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error if slug already exists', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Category 1',
      slug: 'category-1',
    };

    const existing = new Category(
      'existing-id',
      dto.tenant_id,
      null,
      'Existing',
      dto.slug,
      null,
      null,
      0,
      true,
      new Date(),
      new Date()
    );

    mockRepository.findBySlug.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow('Category with this slug already exists');
  });
});

