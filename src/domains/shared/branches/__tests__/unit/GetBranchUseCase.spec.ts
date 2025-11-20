/**
 * Tests unitarios para GetBranchUseCase
 */

import { GetBranchUseCase } from '../../application/use-cases/GetBranchUseCase';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';

describe('GetBranchUseCase', () => {
  let useCase: GetBranchUseCase;
  let mockRepository: jest.Mocked<IBranchRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByTenantId: jest.fn(),
      findMainByTenantId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetBranchUseCase(mockRepository);
  });

  it('should return branch when found', async () => {
    const branch = new Branch(
      'branch-id',
      'tenant-id',
      'Main Branch',
      '123 Main St',
      14.6349,
      -90.5069,
      '+50212345678',
      true,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(branch);

    const result = await useCase.execute('branch-id');

    expect(result).toEqual(branch);
  });

  it('should throw error when branch not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Branch not found');
  });
});

