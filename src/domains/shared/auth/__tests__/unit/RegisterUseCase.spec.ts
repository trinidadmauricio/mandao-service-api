/**
 * Tests unitarios para RegisterUseCase
 */

import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { User } from '../../../users/domain/entities/User';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTenantId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    registerUseCase = new RegisterUseCase(mockUserRepository);
  });

  it('should register a new user successfully', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
      tenant_id: 'tenant-id',
    };

    const createdUser = new User(
      'user-id',
      'tenant-id',
      'test@example.com',
      'hash',
      'CUSTOMER',
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
      'hash',
      'CUSTOMER',
      'John',
      'Doe',
      null,
      null,
      'verification-token',
      null,
      null,
      new Date(),
      0,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(createdUser);
    mockUserRepository.update.mockResolvedValue(updatedUser);

    const result = await registerUseCase.execute(dto);

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('verification_token');
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith('user-id', {
      email_verification_token: expect.any(String),
    });
  });

  it('should throw error if email already exists', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    const existingUser = new User(
      'user-id',
      'tenant-id',
      'test@example.com',
      'hash',
      'CUSTOMER',
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

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(registerUseCase.execute(dto)).rejects.toThrow(
      'User with this email already exists'
    );
  });
});

