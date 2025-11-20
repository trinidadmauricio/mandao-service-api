/**
 * Tests unitarios para CreateBranchUseCase
 */

import { CreateBranchUseCase } from '../../application/use-cases/CreateBranchUseCase';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';

describe('CreateBranchUseCase', () => {
  let useCase: CreateBranchUseCase;
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

    useCase = new CreateBranchUseCase(mockRepository);
  });

  it('should create branch successfully', async () => {
    const dto = {
      tenant_id: 'tenant-id',
      name: 'Main Branch',
      address: '123 Main St',
      gps_lat: 14.6349,
      gps_lng: -90.5069,
      contact_phone: '+50212345678',
      is_main: false,
    };

    const branch = new Branch(
      'branch-id',
      'tenant-id',
      'Main Branch',
      '123 Main St',
      14.6349,
      -90.5069,
      '+50212345678',
      false,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.findMainByTenantId.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(branch);

    const result = await useCase.execute(dto);

    expect(result).toEqual(branch);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should unset other main branch when creating new main branch', async () => {
    const existingMainBranch = new Branch(
      'existing-main-id',
      'tenant-id',
      'Old Main',
      '456 Old St',
      14.6349,
      -90.5069,
      '+50212345678',
      true,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    const newBranch = new Branch(
      'new-branch-id',
      'tenant-id',
      'New Main',
      '789 New St',
      14.6349,
      -90.5069,
      '+50212345678',
      true,
      null,
      'ACTIVE',
      new Date(),
      new Date()
    );

    const dto = {
      tenant_id: 'tenant-id',
      name: 'New Main',
      address: '789 New St',
      gps_lat: 14.6349,
      gps_lng: -90.5069,
      contact_phone: '+50212345678',
      is_main: true,
    };

    mockRepository.findMainByTenantId.mockResolvedValue(existingMainBranch);
    mockRepository.update.mockResolvedValue(existingMainBranch);
    mockRepository.create.mockResolvedValue(newBranch);

    const result = await useCase.execute(dto);

    expect(result).toEqual(newBranch);
    expect(mockRepository.update).toHaveBeenCalledWith('existing-main-id', { is_main: false });
  });
});

