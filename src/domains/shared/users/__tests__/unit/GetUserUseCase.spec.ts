/**
 * Tests unitarios para GetUserUseCase
 */

import { GetUserUseCase } from '../../application/use-cases/GetUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
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

    useCase = new GetUserUseCase(mockRepository);
  });

  it('should return user when found', async () => {
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

    const result = await useCase.execute('user-id');

    expect(result).toEqual(user);
  });

  it('should throw error when user not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('User not found');
  });
});

