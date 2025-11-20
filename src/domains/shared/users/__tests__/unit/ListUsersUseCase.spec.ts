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
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

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
});

