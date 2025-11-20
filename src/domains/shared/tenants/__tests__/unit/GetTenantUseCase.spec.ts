/**
 * Tests unitarios para GetTenantUseCase
 */

import { GetTenantUseCase } from '../../application/use-cases/GetTenantUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';

describe('GetTenantUseCase', () => {
  let useCase: GetTenantUseCase;
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

    useCase = new GetTenantUseCase(mockRepository);
  });

  it('should return tenant when found', async () => {
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

    const result = await useCase.execute('tenant-id');

    expect(result).toEqual(tenant);
    expect(mockRepository.findById).toHaveBeenCalledWith('tenant-id');
  });

  it('should throw error when tenant not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Tenant not found');
  });
});

