/**
 * Tests unitarios para CreateDriverUseCase
 */

import { CreateDriverUseCase } from '../../application/use-cases/CreateDriverUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';

describe('CreateDriverUseCase', () => {
  let useCase: CreateDriverUseCase;
  let mockRepository: jest.Mocked<IDriverRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new CreateDriverUseCase(mockRepository);
  });

  it('should create a driver', async () => {
    const dto = {
      logistics_provider_id: 'provider-id',
      user_id: 'user-id',
      identity_document: 'DOC123',
      driving_license: 'LIC123',
      date_of_birth: new Date('1990-01-01'),
      emergency_contact: { name: 'John Doe', phone: '+50212345678' },
      has_own_vehicle: true,
      work_type: 'FULL_TIME' as const,
      documents: { license: 'file.pdf' },
    };

    const driver = new Driver(
      'driver-id',
      dto.logistics_provider_id,
      dto.user_id,
      dto.identity_document,
      dto.driving_license,
      dto.date_of_birth,
      dto.emergency_contact,
      dto.has_own_vehicle,
      null,
      dto.work_type,
      null,
      'AVAILABLE',
      null,
      0,
      dto.documents,
      new Date(),
      new Date()
    );

    mockRepository.create.mockResolvedValue(driver);

    const result = await useCase.execute(dto);

    expect(result).toEqual(driver);
    expect(mockRepository.create).toHaveBeenCalledWith({
      logistics_provider_id: dto.logistics_provider_id,
      user_id: dto.user_id,
      identity_document: dto.identity_document,
      driving_license: dto.driving_license,
      date_of_birth: dto.date_of_birth,
      emergency_contact: dto.emergency_contact,
      has_own_vehicle: dto.has_own_vehicle,
      vehicle_id: undefined,
      work_type: dto.work_type,
      work_zone: undefined,
      availability_status: undefined,
      documents: dto.documents,
    });
  });
});

