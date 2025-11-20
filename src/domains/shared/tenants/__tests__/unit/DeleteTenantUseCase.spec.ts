/**
 * Tests unitarios para DeleteTenantUseCase
 */

import { DeleteTenantUseCase } from '../../application/use-cases/DeleteTenantUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';

describe('DeleteTenantUseCase', () => {
  let useCase: DeleteTenantUseCase;
  let mockRepository: jest.Mocked<ITenantRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteTenantUseCase(mockRepository);
  });

  it('should delete tenant successfully', async () => {
    const tenant = new Tenant(
      'tenant-id',
      'test-tenant',
      'Test Tenant',
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

    mockRepository.findById.mockResolvedValue(tenant);
    mockRepository.delete.mockResolvedValue();

    await useCase.execute('tenant-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('tenant-id');
  });

  it('should throw error when tenant not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Tenant not found');
  });
});

