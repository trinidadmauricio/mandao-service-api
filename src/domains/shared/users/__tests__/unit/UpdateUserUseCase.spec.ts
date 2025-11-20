/**
 * Tests unitarios para UpdateUserUseCase
 */

import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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

    useCase = new UpdateUserUseCase(mockRepository);
  });

  it('should update user successfully', async () => {
    const existingUser = new User(
      'user-id',
      'tenant-id',
      'test@example.com',
      'old-hash',
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
    );

    const updatedUser = new User(
      'user-id',
      'tenant-id',
      'test@example.com',
      'new-hash',
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
    );

    mockRepository.findById.mockResolvedValue(existingUser);
    mockRepository.update.mockResolvedValue(updatedUser);

    const dto = {
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'SUPERVISOR' as const,
      password: 'newPassword123',
    };

    const result = await useCase.execute('user-id', dto);

    expect(result).toEqual(updatedUser);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should throw error when user not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id', { first_name: 'Jane' })).rejects.toThrow(
      'User not found'
    );
  });
});

