/**
 * Tests unitarios para CreateBrandUseCase
 */

import { CreateBrandUseCase } from '../../application/use-cases/CreateBrandUseCase';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';

describe('CreateBrandUseCase', () => {
  let useCase: CreateBrandUseCase;
  let mockRepository: jest.Mocked<IBrandRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateBrandUseCase(mockRepository);
  });

  it('should create a brand', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Brand 1',
      slug: 'brand-1',
    };

    const brand = new Brand(
      'brand-id',
      dto.tenant_id,
      dto.name,
      dto.slug,
      null,
      null,
      true,
      new Date(),
      new Date()
    );

    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(brand);

    const result = await useCase.execute(dto);

    expect(result).toEqual(brand);
    expect(mockRepository.findBySlug).toHaveBeenCalledWith(dto.tenant_id, dto.slug);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error if slug already exists', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Brand 1',
      slug: 'brand-1',
    };

    const existing = new Brand(
      'existing-id',
      dto.tenant_id,
      'Existing',
      dto.slug,
      null,
      null,
      true,
      new Date(),
      new Date()
    );

    mockRepository.findBySlug.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow('Brand with this slug already exists');
  });
});

