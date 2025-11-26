/**
 * Tests unitarios para ListLogisticsProvidersUseCase
 */

import { ListLogisticsProvidersUseCase } from '../../application/use-cases/ListLogisticsProvidersUseCase';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('ListLogisticsProvidersUseCase', () => {
  let useCase: ListLogisticsProvidersUseCase;
  let mockRepository: jest.Mocked<ILogisticsProviderRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllWithFilters: jest.fn(),
    } as any;

    useCase = new ListLogisticsProvidersUseCase(mockRepository);
  });

  it('should list all logistics providers for SAAS_ADMIN', async () => {
    const providers = [
      new LogisticsProvider(
        'provider-1',
        'tenant-1',
        'Provider 1',
        'TAX1',
        'Rep 1',
        '+1234567890',
        'DOC1',
        'VERIFIED',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
      new LogisticsProvider(
        'provider-2',
        'tenant-2',
        'Provider 2',
        'TAX2',
        'Rep 2',
        '+1234567891',
        'DOC2',
        'VERIFIED',
        null,
        null,
        0,
        'ACTIVE',
        new Date(),
        new Date()
      ),
    ];

    mockRepository.findAll.mockResolvedValue(providers);

    const context = {
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    const result = await useCase.execute(undefined, undefined, context);

    expect(result).toEqual(providers);
    expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should return only own provider for LOGISTICS_PROVIDER', async () => {
    const provider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Company',
      'TAX123',
      'Rep Name',
      '+1234567890',
      'DOC123',
      'VERIFIED',
      null,
      null,
      0,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(provider);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute(undefined, undefined, context);

    expect(result).toEqual([provider]);
    expect(mockRepository.findById).toHaveBeenCalledWith('provider-id');
    expect(mockRepository.findAll).not.toHaveBeenCalled();
  });

  it('should return empty array if LOGISTICS_PROVIDER provider not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const context = {
      currentUserRole: UserRole.LOGISTICS_PROVIDER,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute(undefined, undefined, context);

    expect(result).toEqual([]);
  });

  it('should return only own provider for SUPERVISOR', async () => {
    const provider = new LogisticsProvider(
      'provider-id',
      'tenant-id',
      'Provider Company',
      'TAX123',
      'Rep Name',
      '+1234567890',
      'DOC123',
      'VERIFIED',
      null,
      null,
      0,
      'ACTIVE',
      new Date(),
      new Date()
    );

    mockRepository.findById.mockResolvedValue(provider);

    const context = {
      currentUserRole: UserRole.SUPERVISOR,
      currentUserLogisticsProviderId: 'provider-id',
    };

    const result = await useCase.execute(undefined, undefined, context);

    expect(result).toEqual([provider]);
    expect(mockRepository.findById).toHaveBeenCalledWith('provider-id');
  });
});
