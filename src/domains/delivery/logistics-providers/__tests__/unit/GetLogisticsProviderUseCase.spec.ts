/**
 * Tests unitarios para GetLogisticsProviderUseCase
 */

import { GetLogisticsProviderUseCase } from '../../application/use-cases/GetLogisticsProviderUseCase';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('GetLogisticsProviderUseCase', () => {
  let useCase: GetLogisticsProviderUseCase;
  let mockRepository: jest.Mocked<ILogisticsProviderRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
    } as any;

    useCase = new GetLogisticsProviderUseCase(mockRepository);
  });

  it('should get logistics provider by id', async () => {
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

    const result = await useCase.execute('provider-id');

    expect(result).toEqual(provider);
    expect(mockRepository.findById).toHaveBeenCalledWith('provider-id');
  });

  it('should throw error if logistics provider not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('provider-id')).rejects.toThrow('Logistics provider not found');
  });

  it('should allow LOGISTICS_PROVIDER to access their own provider', async () => {
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

    const result = await useCase.execute('provider-id', context);

    expect(result).toEqual(provider);
  });

  it('should throw error if LOGISTICS_PROVIDER tries to access different provider', async () => {
    const provider = new LogisticsProvider(
      'different-provider-id',
      'tenant-id',
      'Different Provider',
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

    await expect(useCase.execute('different-provider-id', context)).rejects.toThrow(
      'You do not have permission to access this logistics provider'
    );
  });

  it('should allow SAAS_ADMIN to access any logistics provider', async () => {
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
      currentUserRole: UserRole.SAAS_ADMIN,
      currentUserLogisticsProviderId: null,
    };

    const result = await useCase.execute('provider-id', context);

    expect(result).toEqual(provider);
  });
});

