/**
 * Tests unitarios para UpdateTenantUseCase
 */

import { UpdateTenantUseCase } from '../../application/use-cases/UpdateTenantUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';

describe('UpdateTenantUseCase', () => {
  let useCase: UpdateTenantUseCase;
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

    useCase = new UpdateTenantUseCase(mockRepository);
  });

  it('should update tenant successfully', async () => {
    const existingTenant = new Tenant(
      'tenant-id',
      'test-tenant',
      'Old Name',
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

    const updatedTenant = new Tenant(
      'tenant-id',
      'test-tenant',
      'New Name',
      'RETAIL',
      null,
      'ACTIVE',
      null,
      'en',
      'EUR',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(existingTenant);
    mockRepository.update.mockResolvedValue(updatedTenant);

    const dto = {
      name: 'New Name',
      default_locale: 'en',
      default_currency: 'EUR',
    };

    const result = await useCase.execute('tenant-id', dto);

    expect(result).toEqual(updatedTenant);
    expect(mockRepository.update).toHaveBeenCalledWith('tenant-id', dto);
  });

  it('should throw error when tenant not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', { name: 'New Name' })).rejects.toThrow(
      'Tenant not found'
    );
  });
});

