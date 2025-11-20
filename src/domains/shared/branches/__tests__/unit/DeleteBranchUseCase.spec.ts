/**
 * Tests unitarios para DeleteBranchUseCase
 */

import { DeleteBranchUseCase } from '../../application/use-cases/DeleteBranchUseCase';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';

describe('DeleteBranchUseCase', () => {
  let useCase: DeleteBranchUseCase;
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

    useCase = new DeleteBranchUseCase(mockRepository);
  });

  it('should delete branch successfully', async () => {
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
    mockRepository.delete.mockResolvedValue();

    await useCase.execute('branch-id');

    expect(mockRepository.delete).toHaveBeenCalledWith('branch-id');
  });

  it('should throw error when branch not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow('Branch not found');
  });
});

