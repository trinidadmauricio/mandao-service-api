/**
 * Tests unitarios para CreateUserUseCase
 */

import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
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

    useCase = new CreateUserUseCase(mockRepository);
  });

  it('should create a user successfully', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'MERCHANT_USER' as const,
    };

    const user = new User(
      'user-id',
      null,
      'test@example.com',
      'hashed-password',
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

    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(user);

    const result = await useCase.execute(dto);

    expect(result).toEqual(user);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    const dto = {
      email: 'existing@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      role: 'MERCHANT_USER' as const,
    };

    const existingUser = new User(
      'user-id',
      null,
      'existing@example.com',
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

    mockRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(dto)).rejects.toThrow(
      'User with this email already exists'
    );
  });
});

