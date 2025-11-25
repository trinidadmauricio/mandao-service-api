/**
 * Tests unitarios para ListLogisticsProvidersUseCase
 */

import { ListLogisticsProvidersUseCase } from '../../application/use-cases/ListLogisticsProvidersUseCase';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';

describe('ListLogisticsProvidersUseCase', () => {
  let useCase: ListLogisticsProvidersUseCase;
  let mockRepository: jest.Mocked<ILogisticsProviderRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new ListLogisticsProvidersUseCase(mockRepository);
  });

  it('should list providers without filters (backward compatibility)', async () => {
    const tenantId = 'tenant-123';
    const providers = [
      new LogisticsProvider(
        'provider-1',
        tenantId,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'PENDING',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId);

    expect(result).toEqual(providers);
    expect(mockRepository.findAll).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.findAllWithFilters).not.toHaveBeenCalled();
  });

  it('should list providers with status filter', async () => {
    const tenantId = 'tenant-123';
    const filters = { status: 'ACTIVE' as const };
    const providers = [
      new LogisticsProvider(
        'provider-1',
        tenantId,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'VERIFIED',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAllWithFilters.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
    expect(mockRepository.findAll).not.toHaveBeenCalled();
  });

  it('should list providers with verification_status filter', async () => {
    const tenantId = 'tenant-123';
    const filters = { verification_status: 'VERIFIED' as const };
    const providers = [
      new LogisticsProvider(
        'provider-1',
        tenantId,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'VERIFIED',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAllWithFilters.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should list providers with search filter', async () => {
    const tenantId = 'tenant-123';
    const filters = { search: 'Company' };
    const providers = [
      new LogisticsProvider(
        'provider-1',
        tenantId,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'PENDING',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAllWithFilters.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should list providers with is_global filter', async () => {
    const tenantId = 'tenant-123';
    const filters = { is_global: true };
    const providers = [
      new LogisticsProvider(
        'provider-1',
        null, // Global provider
        'Global Company',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'PENDING',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAllWithFilters.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should list providers with multiple filters combined', async () => {
    const tenantId = 'tenant-123';
    const filters = {
      status: 'ACTIVE' as const,
      verification_status: 'VERIFIED' as const,
      search: 'Company',
      is_global: false,
    };
    const providers = [
      new LogisticsProvider(
        'provider-1',
        tenantId,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'VERIFIED',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAllWithFilters.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should use findAll when filters object is empty', async () => {
    const tenantId = 'tenant-123';
    const filters = {};
    const providers = [
      new LogisticsProvider(
        'provider-1',
        tenantId,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'PENDING',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(providers);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAll).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.findAllWithFilters).not.toHaveBeenCalled();
  });

  it('should work without tenant_id', async () => {
    const filters = { status: 'ACTIVE' as const };
    const providers = [
      new LogisticsProvider(
        'provider-1',
        null,
        'Company 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'PENDING',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAllWithFilters.mockResolvedValue(providers);

    const result = await useCase.execute(undefined, filters);

    expect(result).toEqual(providers);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(undefined, filters);
  });
});
