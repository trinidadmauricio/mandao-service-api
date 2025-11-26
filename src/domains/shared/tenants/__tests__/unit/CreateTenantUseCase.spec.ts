/**
 * Tests unitarios para CreateTenantUseCase
 */

import { CreateTenantUseCase } from '../../application/use-cases/CreateTenantUseCase';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';

describe('CreateTenantUseCase', () => {
  let useCase: CreateTenantUseCase;
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

    useCase = new CreateTenantUseCase(mockRepository);
  });

  it('should create a tenant successfully', async () => {
    const dto = {
      slug: 'test-tenant',
      name: 'Test Tenant',
      type: 'RETAIL' as const,
    };

    const tenant = new Tenant(
      'tenant-id',
      'test-tenant',
      'Test Tenant',
      'RETAIL',
      null,
      'TRIAL',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(tenant);

    const result = await useCase.execute(dto);

    expect(result).toEqual(tenant);
    expect(mockRepository.findBySlug).toHaveBeenCalledWith('test-tenant');
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error if slug already exists', async () => {
    const dto = {
      slug: 'existing-tenant',
      name: 'Test Tenant',
      type: 'RETAIL' as const,
    };

    const existingTenant = new Tenant(
      'tenant-id',
      'existing-tenant',
      'Existing Tenant',
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

    mockRepository.findBySlug.mockResolvedValue(existingTenant);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'Tenant with this slug already exists'
    );
  });

  it('should create ON_DEMAND tenant successfully', async () => {
    const dto = {
      slug: 'on-demand-tenant',
      name: 'On Demand Tenant',
      type: 'ON_DEMAND' as const,
    };

    const tenant = new Tenant(
      'tenant-id',
      'on-demand-tenant',
      'On Demand Tenant',
      'ON_DEMAND',
      null,
      'TRIAL',
      null,
      'es',
      'USD',
      null,
      new Date(),
      new Date()
    );

    mockRepository.findBySlug.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(tenant);

    const result = await useCase.execute(dto);

    expect(result).toEqual(tenant);
    expect(mockRepository.findBySlug).toHaveBeenCalledWith('on-demand-tenant');
    expect(mockRepository.create).toHaveBeenCalled();
  });
});

