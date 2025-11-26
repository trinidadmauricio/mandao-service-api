/**
 * Tests unitarios para ListUsersUseCase
 */

import { ListUsersUseCase } from '../../application/use-cases/ListUsersUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new ListUsersUseCase(mockRepository);
  });

  it('should return users for tenant when tenant_id provided', async () => {
    const users = [
      new User(
        'user-1',
        'tenant-id',
        'user1@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findByTenantId.mockResolvedValue(users);

    const result = await useCase.execute('tenant-id');

    expect(result).toEqual(users);
    expect(mockRepository.findByTenantId).toHaveBeenCalledWith('tenant-id');
  });

  it('should return all users when tenant_id not provided', async () => {
    const users = [
      new User(
        'user-1',
        'tenant-id',
        'user1@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(users);

    const result = await useCase.execute();

    expect(result).toEqual(users);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });

  it('should use findAllWithFilters when filters are provided', async () => {
    const tenantId = 'tenant-id';
    const filters = { role: 'MERCHANT_USER' as const };
    const resultData = {
      data: [
        new User(
          'user-1',
          tenantId,
          'user1@example.com',
          'hash',
          'MERCHANT_USER',
          'John',
          'Doe',
          null,
          null,
          null,
          null,
          null,
          new Date(),
          0,
          null,
          'ACTIVE',
          new Date(),
          new Date()
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
    expect(mockRepository.findByTenantId).not.toHaveBeenCalled();
    expect(mockRepository.findAll).not.toHaveBeenCalled();
  });

  it('should filter by role', async () => {
    const tenantId = 'tenant-id';
    const filters = { role: 'SUPERVISOR' as const };
    const resultData = {
      data: [
        new User(
          'user-1',
          tenantId,
          'supervisor@example.com',
          'hash',
          'SUPERVISOR',
          'Jane',
          'Smith',
          null,
          null,
          null,
          null,
          null,
          new Date(),
          0,
          null,
          'ACTIVE',
          new Date(),
          new Date()
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should filter by status', async () => {
    const tenantId = 'tenant-id';
    const filters = { status: 'ACTIVE' as const };
    const resultData = {
      data: [
        new User(
          'user-1',
          tenantId,
          'user1@example.com',
          'hash',
          'MERCHANT_USER',
          'John',
          'Doe',
          null,
          null,
          null,
          null,
          null,
          new Date(),
          0,
          null,
          'ACTIVE',
          new Date(),
          new Date()
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should filter by search term', async () => {
    const tenantId = 'tenant-id';
    const filters = { search: 'john' };
    const resultData = {
      data: [
        new User(
          'user-1',
          tenantId,
          'john@example.com',
          'hash',
          'MERCHANT_USER',
          'John',
          'Doe',
          null,
          null,
          null,
          null,
          null,
          new Date(),
          0,
          null,
          'ACTIVE',
          new Date(),
          new Date()
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should handle pagination', async () => {
    const tenantId = 'tenant-id';
    const filters = { page: 2, limit: 5 };
    const resultData = {
      data: [],
      total: 10,
      page: 2,
      limit: 5,
      totalPages: 2,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should combine multiple filters', async () => {
    const tenantId = 'tenant-id';
    const filters = {
      role: 'MERCHANT_USER' as const,
      status: 'ACTIVE' as const,
      search: 'john',
      page: 1,
      limit: 10,
    };
    const resultData = {
      data: [
        new User(
          'user-1',
          tenantId,
          'john@example.com',
          'hash',
          'MERCHANT_USER',
          'John',
          'Doe',
          null,
          null,
          null,
          null,
          null,
          new Date(),
          0,
          null,
          'ACTIVE',
          new Date(),
          new Date()
        ),
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(tenantId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(tenantId, filters);
  });

  it('should use findByTenantId when no filters provided but tenant_id is provided', async () => {
    const tenantId = 'tenant-id';
    const users = [
      new User(
        'user-1',
        tenantId,
        'user1@example.com',
        'hash',
        'MERCHANT_USER',
        'John',
        'Doe',
        null,
        null,
        null,
        null,
        null,
        new Date(),
        0,
        null,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findByTenantId.mockResolvedValue(users);

    const result = await useCase.execute(tenantId);

    expect(result).toEqual(users);
    expect(mockRepository.findByTenantId).toHaveBeenCalledWith(tenantId);
    expect(mockRepository.findAllWithFilters).not.toHaveBeenCalled();
  });
});

