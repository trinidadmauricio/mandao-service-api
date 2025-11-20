/**
 * Tests unitarios para UpdateBranchUseCase
 */

import { UpdateBranchUseCase } from '../../application/use-cases/UpdateBranchUseCase';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';

describe('UpdateBranchUseCase', () => {
  let useCase: UpdateBranchUseCase;
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

    useCase = new UpdateBranchUseCase(mockRepository);
  });

  it('should update branch successfully', async () => {
    const existingBranch = new Branch(
      'branch-id',
      'tenant-id',
      'Old Name',
      '123 Old St',
      14.6349,
      -90.5069,
      '+50212345678',
      false,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    const updatedBranch = new Branch(
      'branch-id',
      'tenant-id',
      'New Name',
      '456 New St',
      14.6350,
      -90.5070,
      '+50287654321',
      true,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(existingBranch);
    mockRepository.findMainByTenantId.mockResolvedValue(null);
    mockRepository.update.mockResolvedValue(updatedBranch);

    const dto = {
      name: 'New Name',
      address: '456 New St',
      gps_lat: 14.6350,
      gps_lng: -90.5070,
      contact_phone: '+50287654321',
      is_main: true,
    };

    const result = await useCase.execute('branch-id', dto);

    expect(result).toEqual(updatedBranch);
    expect(mockRepository.update).toHaveBeenCalledWith('branch-id', dto);
  });

  it('should unset other main branch when setting new main', async () => {
    const existingBranch = new Branch(
      'branch-id',
      'tenant-id',
      'Branch',
      '123 St',
      14.6349,
      -90.5069,
      '+50212345678',
      false,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    const existingMainBranch = new Branch(
      'main-branch-id',
      'tenant-id',
      'Main Branch',
      '456 St',
      14.6349,
      -90.5069,
      '+50212345678',
      true,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    const updatedBranch = new Branch(
      'branch-id',
      'tenant-id',
      'Branch',
      '123 St',
      14.6349,
      -90.5069,
      '+50212345678',
      true,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(existingBranch);
    mockRepository.findMainByTenantId.mockResolvedValue(existingMainBranch);
    mockRepository.update.mockResolvedValueOnce(existingMainBranch);
    mockRepository.update.mockResolvedValueOnce(updatedBranch);

    const dto = { is_main: true };

    await useCase.execute('branch-id', dto);

    expect(mockRepository.update).toHaveBeenCalledWith('main-branch-id', { is_main: false });
  });
});

