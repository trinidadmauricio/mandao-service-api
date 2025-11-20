/**
 * Tests unitarios para DeleteUserUseCase
 */

import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
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

    useCase = new DeleteUserUseCase(mockRepository);
  });

  it('should delete user successfully', async () => {
    const user = new User(
      'user-id',
      'tenant-id',
      'test@example.com',
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
    );

    mockRepository.findById.mockResolvedValue(user);
    mockRepository.delete.mockResolvedValue();

    await useCase.execute('user-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('user-id');
  });

  it('should throw error when user not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('User not found');
  });
});

