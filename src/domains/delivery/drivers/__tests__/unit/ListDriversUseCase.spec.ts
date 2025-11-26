/**
 * Tests unitarios para ListDriversUseCase
 */

import { ListDriversUseCase } from '../../application/use-cases/ListDriversUseCase';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';

describe('ListDriversUseCase', () => {
  let useCase: ListDriversUseCase;
  let mockRepository: jest.Mocked<IDriverRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new ListDriversUseCase(mockRepository);
  });

  it('should list drivers without filters (backward compatibility)', async () => {
    const logisticsProviderId = 'provider-123';
    const drivers = [
      new Driver(
        'driver-1',
        logisticsProviderId,
        'user-1',
        'DOC123',
        'LIC123',
        new Date('1990-01-01'),
        { name: 'John Doe', phone: '+50212345678' },
        true,
        null,
        'FULL_TIME',
        null,
        'AVAILABLE',
        null,
        0,
        {},
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(drivers);

    const result = await useCase.execute(logisticsProviderId);

    expect(result).toEqual(drivers);
    expect(mockRepository.findAll).toHaveBeenCalledWith(logisticsProviderId, undefined);
    expect(mockRepository.findAllWithFilters).not.toHaveBeenCalled();
  });

  it('should list drivers with availability_status filter (backward compatibility)', async () => {
    const logisticsProviderId = 'provider-123';
    const availabilityStatus = 'AVAILABLE' as const;
    const drivers = [
      new Driver(
        'driver-1',
        logisticsProviderId,
        'user-1',
        'DOC123',
        'LIC123',
        new Date('1990-01-01'),
        { name: 'John Doe', phone: '+50212345678' },
        true,
        null,
        'FULL_TIME',
        null,
        'AVAILABLE',
        null,
        0,
        {},
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(drivers);

    const result = await useCase.execute(logisticsProviderId, availabilityStatus);

    expect(result).toEqual(drivers);
    expect(mockRepository.findAll).toHaveBeenCalledWith(logisticsProviderId, availabilityStatus);
    expect(mockRepository.findAllWithFilters).not.toHaveBeenCalled();
  });

  it('should list drivers with availability_status filter via DTO', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = { availability_status: 'AVAILABLE' as const };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          logisticsProviderId,
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(logisticsProviderId, filters);
    expect(mockRepository.findAll).not.toHaveBeenCalled();
  });

  it('should list drivers with work_type filter', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = { work_type: 'FULL_TIME' as const };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          logisticsProviderId,
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(logisticsProviderId, filters);
  });

  it('should list drivers with search filter', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = { search: 'John' };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          logisticsProviderId,
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(logisticsProviderId, filters);
  });

  it('should list drivers with logistics_provider_id filter', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = { logistics_provider_id: 'provider-456' };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          'provider-456',
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(logisticsProviderId, filters);
  });

  it('should list drivers with pagination', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = { page: 1, limit: 10 };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          logisticsProviderId,
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 25,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(logisticsProviderId, filters);
  });

  it('should list drivers with multiple filters combined', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = {
      availability_status: 'AVAILABLE' as const,
      work_type: 'FULL_TIME' as const,
      search: 'John',
      page: 1,
      limit: 10,
    };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          logisticsProviderId,
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(logisticsProviderId, filters);
  });

  it('should use findAll when filters object is empty', async () => {
    const logisticsProviderId = 'provider-123';
    const filters = {};
    const drivers = [
      new Driver(
        'driver-1',
        logisticsProviderId,
        'user-1',
        'DOC123',
        'LIC123',
        new Date('1990-01-01'),
        { name: 'John Doe', phone: '+50212345678' },
        true,
        null,
        'FULL_TIME',
        null,
        'AVAILABLE',
        null,
        0,
        {},
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(drivers);

    const result = await useCase.execute(logisticsProviderId, filters);

    expect(Array.isArray(result)).toBe(true);
    expect((result as any).data).toEqual(drivers);
    expect((result as any).total).toBe(drivers.length);
    expect(mockRepository.findAll).toHaveBeenCalledWith(logisticsProviderId, undefined);
    expect(mockRepository.findAllWithFilters).not.toHaveBeenCalled();
  });

  it('should work without logistics_provider_id', async () => {
    const filters = { availability_status: 'AVAILABLE' as const };
    const resultData = {
      data: [
        new Driver(
          'driver-1',
          'provider-123',
          'user-1',
          'DOC123',
          'LIC123',
          new Date('1990-01-01'),
          { name: 'John Doe', phone: '+50212345678' },
          true,
          null,
          'FULL_TIME',
          null,
          'AVAILABLE',
          null,
          0,
          {},
          new Date(),
          new Date()
        ),
      ],
      total: 1,
    };

    mockRepository.findAllWithFilters.mockResolvedValue(resultData);

    const result = await useCase.execute(undefined, filters);

    expect(result).toEqual(resultData);
    expect(mockRepository.findAllWithFilters).toHaveBeenCalledWith(undefined, filters);
  });
});

