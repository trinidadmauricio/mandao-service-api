/**
 * Tests unitarios para ListTenantsUseCase
 */

import { ListTenantsUseCase } from '../../application/use-cases/ListTenantsUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';

describe('ListTenantsUseCase', () => {
  let useCase: ListTenantsUseCase;
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

    useCase = new ListTenantsUseCase(mockRepository);
  });

  it('should return all tenants', async () => {
    const tenants = [
      new Tenant(
        'tenant-1',
        'tenant-1',
        'Tenant 1',
        'RETAIL',
        null,
        'ACTIVE',
        null,
        'es',
        'USD',
        null,
        new Date(),
        new Date()
      ),
      new Tenant(
        'tenant-2',
        'tenant-2',
        'Tenant 2',
        'ON_DEMAND',
        null,
        'ACTIVE',
        null,
        'en',
        'EUR',
        null,
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(tenants);

    const result = await useCase.execute();

    expect(result).toEqual(tenants);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});

